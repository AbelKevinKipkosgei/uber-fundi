"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { X, Briefcase } from "lucide-react";

export default function CreateBookingModal({
  providerId,
  providerName,
  onClose,
}: {
  providerId: number;
  providerName: string;
  onClose: () => void;
}) {
  const router = useRouter();
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          providerId,
          description,
          amount: parseInt(amount, 10),
        }),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        setError(data?.error ?? "Failed to create booking");
        return;
      }

      router.push(`/bookings/${data.booking.id}`);
    } catch (err) {
      console.error(err);
      setError("Failed to create booking");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/40 px-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center mb-4">
          <Briefcase className="w-6 h-6 text-blue-600" />
        </div>

        <h2 className="text-lg font-semibold text-gray-900">
          Request a Booking
        </h2>
        <p className="text-sm text-gray-500 mt-1">
          Confirm the agreed job and price with {providerName}.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4 mt-5">
          {error && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-3 py-2">
              {error}
            </p>
          )}

          <div>
            <label className="text-sm text-gray-600">Job description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Rewire two bedrooms and install 3 sockets"
              required
              rows={3}
              className="w-full mt-1 px-3 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-700 resize-none"
            />
          </div>

          <div>
            <label className="text-sm text-gray-600">Agreed amount (KES)</label>
            <input
              type="number"
              min={1}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="e.g. 2500"
              required
              className="w-full mt-1 px-3 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-700"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-xl bg-blue-600 text-white py-2.5 font-medium hover:bg-blue-700 transition disabled:opacity-60"
          >
            {submitting ? "Creating..." : "Create Booking"}
          </button>
        </form>
      </div>
    </div>
  );
}
