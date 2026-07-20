import { prisma } from "@/lib/prisma";
import { resolveParticipant } from "@/lib/resolveParticipant";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function GET() {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const myProvider = await prisma.provider.findUnique({
      where: { clerkUserId: userId },
    });

    const bookings = await prisma.booking.findMany({
      where: {
        OR: [
          { clientId: userId },
          ...(myProvider ? [{ providerId: myProvider.id }] : []),
        ],
      },
      include: { provider: true },
      orderBy: { createdAt: "desc" },
    });

    const withRoles = await Promise.all(
      bookings.map(async (b) => {
        const isClient = b.clientId === userId;
        const client = await resolveParticipant(b.clientId);

        return {
          id: b.id,
          description: b.description,
          amount: b.amount,
          status: b.status,
          createdAt: b.createdAt,
          role: isClient ? "CLIENT" : "PROVIDER",
          seen: isClient ? b.clientSeen : b.providerSeen,
          provider: { id: b.provider.id, name: b.provider.name },
          client,
        };
      }),
    );

    return NextResponse.json(withRoles);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to fetch bookings" },
      { status: 500 },
    );
  }
}

export async function POST(req: Request) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { providerId, description, amount } = body;

  if (!providerId || !description || !Number.isInteger(amount) || amount <= 0) {
    return NextResponse.json(
      { error: "Missing or invalid fields" },
      { status: 400 },
    );
  }

  try {
    const provider = await prisma.provider.findUnique({
      where: { id: providerId },
    });

    if (!provider) {
      return NextResponse.json(
        { error: "Provider not found" },
        { status: 404 },
      );
    }

    if (provider.clerkUserId === userId) {
      return NextResponse.json(
        { error: "You can't book yourself" },
        { status: 400 },
      );
    }

    const booking = await prisma.booking.create({
      data: {
        clientId: userId,
        providerId,
        description,
        amount,
        clientSeen: true,
        providerSeen: false,
      },
      include: { provider: true },
    });

    return NextResponse.json({ success: true, booking });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to create booking" },
      { status: 500 },
    );
  }
}
