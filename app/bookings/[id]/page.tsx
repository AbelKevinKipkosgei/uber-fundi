"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  Smartphone,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from "lucide-react";

type Booking = {
  id: string;
  description: string;
  amount: number;
  status: string;
  createdAt: string;
  isClient: boolean;
  isProvider: boolean;
  provider: { id: number; name: string };
  client: { name: string };
  payments: { status: string; mpesaReceiptNumber: string | null }[];
};

const POLL_INTERVAL_MS = 3000;
const POLL_TIMEOUT_MS = 90000;

export default function BookingDetailPage() {
  const params = useParams<{ id: string }>();

  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [payingNow, setPayingNow] = useState(false);
  const [payError, setPayError] = useState<string | null>(null);
  const [waitingForPin, setWaitingForPin] = useState(false);

  const [updatingStatus, setUpdatingStatus] = useState(false);

  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchBooking = async () => {
    try {
      const res = await fetch(`/api/bookings/${params.id}`);
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        setError(data?.error ?? "Failed to load booking");
        return null;
      }
      const data: Booking = await res.json();
      setBooking(data);
      return data;
    } catch (err) {
      console.error(err);
      setError("Failed to load booking");
      return null;
    }
  };

  useEffect(() => {
    fetchBooking().finally(() => setLoading(false));

    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id]);

  const handlePay = async () => {
    setPayingNow(true);
    setPayError(null);

    try {
      const res = await fetch("/api/payments/stk-push", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingId: params.id }),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        setPayError(data?.error ?? "Failed to initiate payment");
        return;
      }

      setWaitingForPin(true);

      pollRef.current = setInterval(async () => {
        const updated = await fetchBooking();
        if (updated && updated.status !== "PENDING") {
          if (pollRef.current) clearInterval(pollRef.current);
          if (timeoutRef.current) clearTimeout(timeoutRef.current);
          setWaitingForPin(false);
        }
      }, POLL_INTERVAL_MS);

      timeoutRef.current = setTimeout(() => {
        if (pollRef.current) clearInterval(pollRef.current);
        setWaitingForPin(false);
      }, POLL_TIMEOUT_MS);
    } catch (err) {
      console.error(err);
      setPayError("Failed to initiate payment");
    } finally {
      setPayingNow(false);
    }
  };

  const handleMarkComplete = async () => {
    setUpdatingStatus(true);
    try {
      const res = await fetch(`/api/bookings/${params.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "COMPLETED" }),
      });
      if (res.ok) await fetchBooking();
    } catch (err) {
      console.error(err);
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleCancel = async () => {
    if (!confirm("Cancel this booking?")) return;
    setUpdatingStatus(true);
    try {
      const res = await fetch(`/api/bookings/${params.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "CANCELLED" }),
      });
      if (res.ok) await fetchBooking();
    } catch (err) {
      console.error(err);
    } finally {
      setUpdatingStatus(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-gray-50 via-white to-blue-50 px-6 py-14">
        <div className="max-w-lg mx-auto space-y-6">
          <div className="h-8 w-40 bg-white rounded-lg animate-pulse border" />
          <div className="h-64 rounded-3xl bg-white animate-pulse border" />
        </div>
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="min-h-screen bg-linear-to-br from-gray-50 via-white to-blue-50 flex items-center justify-center px-6">
        <div className="bg-white rounded-2xl border p-10 text-center shadow-sm max-w-md">
          <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-3" />
          <p className="text-gray-700">{error ?? "Booking not found"}</p>
        </div>
      </div>
    );
  }

  const latestPayment = booking.payments[booking.payments.length - 1];

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 via-white to-blue-50">
      <div className="max-w-lg mx-auto px-6 pt-12 pb-20">
        <Link
          href="/bookings"
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          All bookings
        </Link>

        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8">
          <span
            className={`inline-block px-3 py-1 rounded-full text-xs font-medium mb-4 ${
              booking.status === "PENDING"
                ? "bg-yellow-50 text-yellow-700"
                : booking.status === "PAID"
                  ? "bg-blue-50 text-blue-700"
                  : booking.status === "COMPLETED"
                    ? "bg-green-50 text-green-700"
                    : "bg-gray-100 text-gray-500"
            }`}
          >
            {booking.status}
          </span>

          <h1 className="text-xl font-bold text-gray-900">
            {booking.description}
          </h1>
          <p className="text-3xl font-bold text-gray-900 mt-3">
            KES {booking.amount}
          </p>

          <div className="mt-4 text-sm text-gray-500 space-y-1">
            <p>
              {booking.isClient ? "Provider" : "Client"}:{" "}
              <span className="text-gray-900 font-medium">
                {booking.isClient ? booking.provider.name : booking.client.name}
              </span>
            </p>
            <p>Requested {new Date(booking.createdAt).toLocaleDateString()}</p>
          </div>

          {latestPayment?.mpesaReceiptNumber && (
            <p className="mt-3 text-sm text-green-700 bg-green-50 rounded-xl px-3 py-2">
              Paid — M-Pesa receipt: {latestPayment.mpesaReceiptNumber}
            </p>
          )}

          {payError && (
            <p className="mt-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-3 py-2">
              {payError}
            </p>
          )}

          {waitingForPin && (
            <div className="mt-4 flex items-center gap-2 text-sm text-blue-700 bg-blue-50 rounded-xl px-3 py-2.5">
              <Loader2 className="w-4 h-4 animate-spin" />
              Check your phone and enter your M-Pesa PIN to complete payment...
            </div>
          )}

          {booking.isClient &&
            booking.status === "PENDING" &&
            !waitingForPin && (
              <div className="flex gap-3 mt-6">
                <button
                  onClick={handlePay}
                  disabled={payingNow}
                  className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-green-600 text-white py-3 font-medium hover:bg-green-700 transition disabled:opacity-60"
                >
                  <Smartphone className="w-5 h-5" />
                  {payingNow ? "Sending..." : "Pay with M-Pesa"}
                </button>
                <button
                  onClick={handleCancel}
                  disabled={updatingStatus}
                  className="px-4 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 transition disabled:opacity-60"
                >
                  Cancel
                </button>
              </div>
            )}

          {booking.isClient && booking.status === "PAID" && (
            <button
              onClick={handleMarkComplete}
              disabled={updatingStatus}
              className="flex items-center justify-center gap-2 w-full mt-6 rounded-xl bg-blue-600 text-white py-3 font-medium hover:bg-blue-700 transition disabled:opacity-60"
            >
              <CheckCircle2 className="w-5 h-5" />
              Mark Job Complete
            </button>
          )}

          {booking.isProvider && booking.status === "PENDING" && (
            <p className="mt-6 text-sm text-gray-500">
              Waiting for client to pay.
            </p>
          )}
          {booking.isProvider && booking.status === "PAID" && (
            <p className="mt-6 text-sm text-blue-700">
              Payment received. Waiting for the client to confirm the job is
              complete.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
