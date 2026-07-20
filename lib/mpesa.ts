const BASE_URL =
  process.env.MPESA_ENVIRONMENT === "production"
    ? "https://api.safaricom.co.ke"
    : "https://sandbox.safaricom.co.ke";

export async function getMpesaAccessToken() {
  const auth = Buffer.from(
    `${process.env.MPESA_CONSUMER_KEY}:${process.env.MPESA_CONSUMER_SECRET}`,
  ).toString("base64");

  const res = await fetch(
    `${BASE_URL}/oauth/v1/generate?grant_type=client_credentials`,
    {
      headers: { Authorization: `Basic ${auth}` },
    },
  );

  if (!res.ok) {
    throw new Error("Failed to get M-Pesa access token");
  }

  const data = await res.json();
  return data.access_token as string;
}

function getTimestamp() {
  return new Date()
    .toISOString()
    .replace(/[^0-9]/g, "")
    .slice(0, 14);
}

function normalizeKenyanPhone(phone: string): string {
  const digitsOnly = phone.replace(/[^\d]/g, "");
  if (digitsOnly.startsWith("254")) return digitsOnly;
  if (digitsOnly.startsWith("0")) return `254${digitsOnly.slice(1)}`;
  return digitsOnly;
}

export async function initiateStkPush({
  phone,
  amount,
  accountReference,
  transactionDesc,
}: {
  phone: string;
  amount: number;
  accountReference: string;
  transactionDesc: string;
}) {
  const accessToken = await getMpesaAccessToken();
  const timestamp = getTimestamp();
  const password = Buffer.from(
    `${process.env.MPESA_SHORTCODE}${process.env.MPESA_PASSKEY}${timestamp}`,
  ).toString("base64");

  const normalizedPhone = normalizeKenyanPhone(phone);

  const res = await fetch(`${BASE_URL}/mpesa/stkpush/v1/processrequest`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      BusinessShortCode: process.env.MPESA_SHORTCODE,
      Password: password,
      Timestamp: timestamp,
      TransactionType: "CustomerPayBillOnline",
      Amount: amount,
      PartyA: normalizedPhone,
      PartyB: process.env.MPESA_SHORTCODE,
      PhoneNumber: normalizedPhone,
      CallBackURL: `${process.env.NEXT_PUBLIC_BASE_URL}/api/payments/callback`,
      AccountReference: accountReference,
      TransactionDesc: transactionDesc,
    }),
  });

  const data = await res.json();

  if (!res.ok || data.errorCode) {
    throw new Error(data.errorMessage || "STK push request failed");
  }

  return data as {
    MerchantRequestID: string;
    CheckoutRequestID: string;
    ResponseCode: string;
    ResponseDescription: string;
    CustomerMessage: string;
  };
}
