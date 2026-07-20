import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const stkCallback = body?.Body?.stkCallback;

    if (!stkCallback) {
      return NextResponse.json({ ResultCode: 0, ResultDesc: "Ignored" });
    }

    const { CheckoutRequestID, ResultCode, ResultDesc, CallbackMetadata } =
      stkCallback;

    const payment = await prisma.payment.findUnique({
      where: { checkoutRequestId: CheckoutRequestID },
    });

    if (!payment) {
      console.error(
        "Received callback for unknown CheckoutRequestID",
        CheckoutRequestID,
      );
      return NextResponse.json({ ResultCode: 0, ResultDesc: "Accepted" });
    }

    const succeeded = ResultCode === 0;
    let mpesaReceiptNumber: string | null = null;

    if (succeeded && CallbackMetadata?.Item) {
      const receiptItem = CallbackMetadata.Item.find(
        (item: { Name: string }) => item.Name === "MpesaReceiptNumber",
      );
      mpesaReceiptNumber = receiptItem?.Value ?? null;
    }

    await prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: succeeded ? "SUCCESS" : "FAILED",
        resultCode: ResultCode,
        resultDesc: ResultDesc,
        mpesaReceiptNumber,
      },
    });

    if (succeeded) {
      await prisma.booking.update({
        where: { id: payment.bookingId },
        data: { status: "PAID", clientSeen: true, providerSeen: false },
      });
    }

    return NextResponse.json({ ResultCode: 0, ResultDesc: "Accepted" });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ ResultCode: 0, ResultDesc: "Accepted" });
  }
}
