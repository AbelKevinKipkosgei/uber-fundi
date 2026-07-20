import { prisma } from "@/lib/prisma";
import { queryStkPushStatus } from "@/lib/mpesa";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  try {
    const payment = await prisma.payment.findUnique({
      where: { id },
      include: { booking: true },
    });

    if (!payment) {
      return NextResponse.json({ error: "Payment not found" }, { status: 404 });
    }

    if (payment.booking.clientId !== userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (payment.status !== "PENDING" || !payment.checkoutRequestId) {
      return NextResponse.json({ status: payment.status });
    }

    const result = await queryStkPushStatus(payment.checkoutRequestId);
    const succeeded = result.ResultCode === "0";

    // Note: the query API doesn't return the receipt number the way the
    // callback does — this just resolves the stuck PENDING state; if it
    // says success, the callback (if it eventually arrives) still handles
    // recording the receipt properly. This is a fallback, not a replacement.
    if (result.ResultCode !== "1037") {
      await prisma.payment.update({
        where: { id },
        data: {
          status: succeeded ? "SUCCESS" : "FAILED",
          resultCode: parseInt(result.ResultCode, 10),
          resultDesc: result.ResultDesc,
        },
      });

      if (succeeded) {
        await prisma.booking.update({
          where: { id: payment.bookingId },
          data: { status: "PAID", clientSeen: true, providerSeen: false },
        });
      }
    }

    return NextResponse.json({
      resultCode: result.ResultCode,
      resultDesc: result.ResultDesc,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to query payment status" },
      { status: 500 },
    );
  }
}
