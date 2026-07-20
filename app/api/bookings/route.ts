import { prisma } from "@/lib/prisma";
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
      include: { provider: true, payments: true },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(bookings);
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
      data: { clientId: userId, providerId, description, amount },
      include: { provider: true },
    });

    await prisma.notification.create({
      data: {
        userId: provider.clerkUserId,
        type: "NEW_BOOKING",
        title: "New booking request",
        body: `${description.slice(0, 80)} — KES ${amount}`,
        link: `/bookings/${booking.id}`,
      },
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
