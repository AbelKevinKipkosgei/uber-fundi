import { prisma } from "@/lib/prisma";
import { resolveParticipant } from "@/lib/resolveParticipant";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { parseBody } from "@/lib/validate";
import { updateBookingSchema } from "@/lib/schemas";

async function assertParty(bookingId: string, userId: string) {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: { provider: true, payments: true },
  });

  if (!booking) return { booking: null, isClient: false, isProvider: false };

  return {
    booking,
    isClient: booking.clientId === userId,
    isProvider: booking.provider.clerkUserId === userId,
  };
}

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  try {
    const { booking, isClient, isProvider } = await assertParty(id, userId);

    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    if (!isClient && !isProvider) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (isClient && !booking.clientSeen) {
      await prisma.booking.update({
        where: { id },
        data: { clientSeen: true },
      });
    }
    if (isProvider && !booking.providerSeen) {
      await prisma.booking.update({
        where: { id },
        data: { providerSeen: true },
      });
    }

    const client = await resolveParticipant(booking.clientId);

    return NextResponse.json({ ...booking, client, isClient, isProvider });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to fetch booking" },
      { status: 500 },
    );
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const parsed = await parseBody(req, updateBookingSchema);
  if ("error" in parsed) return parsed.error;
  const { status } = parsed.data;

  const VALID_TRANSITIONS: Record<string, string[]> = {
    PENDING: ["CANCELLED"],
    PAID: ["COMPLETED", "CANCELLED"],
  };

  try {
    const { booking, isClient, isProvider } = await assertParty(id, userId);

    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    if (!isClient && !isProvider) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (status === "COMPLETED" && !isClient) {
      return NextResponse.json(
        { error: "Only the client can mark a booking complete" },
        { status: 403 },
      );
    }

    const allowedNext = VALID_TRANSITIONS[booking.status] ?? [];

    if (!allowedNext.includes(status)) {
      return NextResponse.json(
        { error: `Cannot move booking from ${booking.status} to ${status}` },
        { status: 400 },
      );
    }

    const updated = await prisma.booking.update({
      where: { id },
      data: {
        status,
        clientSeen: isClient,
        providerSeen: isProvider,
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to update booking" },
      { status: 500 },
    );
  }
}
