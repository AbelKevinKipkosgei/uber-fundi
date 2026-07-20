import { prisma } from "@/lib/prisma";
import { initiateStkPush } from "@/lib/mpesa";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// Sandbox only accepts this fixed test number, regardless of what a real
// user's phone number is — swap this logic out once you go to production.
const SANDBOX_TEST_PHONE = "254708374149";

export async function POST(req: Request) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { bookingId } = body;

  try {
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: { provider: true },
    });

    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    if (booking.clientId !== userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (booking.status !== "PENDING") {
      return NextResponse.json(
        { error: "This booking is not awaiting payment" },
        { status: 400 },
      );
    }

    const phoneToCharge =
      process.env.MPESA_ENVIRONMENT === "production"
        ? body.phone // real phone number, collected from the client in production
        : SANDBOX_TEST_PHONE;

    const stkResponse = await initiateStkPush({
      phone: phoneToCharge,
      amount: booking.amount,
      accountReference: booking.id,
      transactionDesc: `UberFundi booking with ${booking.provider.name}`,
    });

    const payment = await prisma.payment.create({
      data: {
        bookingId: booking.id,
        phone: phoneToCharge,
        amount: booking.amount,
        merchantRequestId: stkResponse.MerchantRequestID,
        checkoutRequestId: stkResponse.CheckoutRequestID,
        status: "PENDING",
      },
    });

    return NextResponse.json({
      success: true,
      payment,
      message: stkResponse.CustomerMessage,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to initiate payment",
      },
      { status: 500 },
    );
  }
}
