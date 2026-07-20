"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Briefcase, UserCheck } from "lucide-react";

type Booking = {
  id: string;
  description: string;
  amount: number;
  status: string;
  createdAt: string;
  role: "CLIENT" | "PROVIDER";
  seen: boolean;
  provider: { id: number; name: string };
  client: { name: string };
};

const STATUS_STYLES: Record<string, string> = {
  PENDING: "bg-yellow-50 text-yellow-700",
  PAID: "bg-blue-50 text-blue-700",
  COMPLETED: "bg-green-50 text-green-700",
  CANCELLED: "bg-gray-100 text-gray-500",
};

function BookingRow({ booking }: { booking: Booking }) {
  const counterpartName =
    booking.role === "CLIENT" ? booking.provider.name : booking.client.name;

  return (
    <Link
      href={`/bookings/${booking.id}`}
      className="flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition"
    >
      <div className="flex items-center gap-2 min-w-0">
        {!booking.seen && (
          <span className="w-2 h-2 rounded-full bg-blue-600 shrink-0" />
        )}
        <div className="min-w-0">
          <p
            className={`truncate ${
              !booking.seen
                ? "font-semibold text-gray-900"
                : "font-medium text-gray-900"
            }`}
          >
            {counterpartName}
          </p>
          <p className="text-sm text-gray-500 truncate">
            {booking.description}
          </p>
        </div>
      </div>
      <div className="text-right shrink-0 ml-4">
        <p className="font-semibold text-gray-900">KES {booking.amount}</p>
        <span
          className={`inline-block mt-1 px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_STYLES[booking.status]}`}
        >
          {booking.status}
        </span>
      </div>
    </Link>
  );
}

export default function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/bookings")
      .then((r) => r.json())
      .then((data) => setBookings(Array.isArray(data) ? data : []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const asClient = bookings.filter((b) => b.role === "CLIENT");
  const asProvider = bookings.filter((b) => b.role === "PROVIDER");

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 via-white to-blue-50">
      <div className="max-w-2xl mx-auto px-6 pt-12 pb-20">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">My Bookings</h1>

        {loading ? (
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <div
                key={i}
                className="h-20 rounded-2xl bg-white animate-pulse border"
              />
            ))}
          </div>
        ) : bookings.length === 0 ? (
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-10 text-center">
            <Briefcase className="w-8 h-8 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No bookings yet.</p>
          </div>
        ) : (
          <div className="space-y-8">
            <div>
              <h2 className="flex items-center gap-2 text-sm font-semibold text-gray-500 mb-3">
                <Briefcase className="w-4 h-4" />
                Requested by you
              </h2>
              {asClient.length === 0 ? (
                <p className="text-sm text-gray-400 bg-white rounded-2xl border border-gray-100 px-6 py-8 text-center">
                  You haven&apos;t requested any bookings yet.
                </p>
              ) : (
                <div className="bg-white rounded-3xl border border-gray-100 shadow-sm divide-y divide-gray-100 overflow-hidden">
                  {asClient.map((b) => (
                    <BookingRow key={b.id} booking={b} />
                  ))}
                </div>
              )}
            </div>

            {asProvider.length > 0 && (
              <div>
                <h2 className="flex items-center gap-2 text-sm font-semibold text-gray-500 mb-3">
                  <UserCheck className="w-4 h-4" />
                  Received from clients
                </h2>
                <div className="bg-white rounded-3xl border border-gray-100 shadow-sm divide-y divide-gray-100 overflow-hidden">
                  {asProvider.map((b) => (
                    <BookingRow key={b.id} booking={b} />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
