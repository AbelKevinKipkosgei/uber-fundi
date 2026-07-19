"use client";

import { useState } from "react";
import { X, Flag } from "lucide-react";

const REASONS = [
  { value: "SPAM", label: "Spam" },
  { value: "SCAM_OR_FRAUD", label: "Scam or fraud" },
  { value: "INAPPROPRIATE_BEHAVIOR", label: "Inappropriate behavior" },
  { value: "FAKE_PROFILE", label: "Fake profile" },
  { value: "OTHER", label: "Other" },
];

export default function ReportModal({
  target,
  onClose,
}: {
  target: { providerId?: number; conversationId?: string };
  onClose: () => void;
}) {
  const [reason, setReason] = useState("");
  const [details, setDetails] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...target, reason, details }),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        setError(data?.error ?? "Failed to submit report");
        return;
      }

      setSubmitted(true);
    } catch (err) {
      console.error(err);
      setError("Failed to submit report");
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

        {submitted ? (
          <div className="text-center py-4">
            <Flag className="w-8 h-8 text-blue-600 mx-auto mb-3" />
            <p className="font-medium text-gray-900">Report submitted</p>
            <p className="text-sm text-gray-500 mt-1">
              Thanks for letting us know — our team will review this.
            </p>
            <button
              onClick={onClose}
              className="mt-5 w-full rounded-xl bg-gray-100 text-gray-700 py-2.5 font-medium hover:bg-gray-200 transition"
            >
              Close
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">Report</h2>

            {error && (
              <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-3 py-2">
                {error}
              </p>
            )}

            <div>
              <label className="text-sm text-gray-600">Reason</label>
              <select
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                required
                className="w-full mt-1 px-3 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-700"
              >
                <option value="" disabled>
                  Select a reason
                </option>
                {REASONS.map((r) => (
                  <option key={r.value} value={r.value}>
                    {r.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm text-gray-600">
                Details <span className="text-gray-400">(optional)</span>
              </label>
              <textarea
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                rows={3}
                className="w-full mt-1 px-3 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-700 resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={submitting || !reason}
              className="w-full rounded-xl bg-red-600 text-white py-2.5 font-medium hover:bg-red-700 transition disabled:opacity-60"
            >
              {submitting ? "Submitting..." : "Submit Report"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
