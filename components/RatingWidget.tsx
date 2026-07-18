"use client";

import { useEffect, useState } from "react";
import { Star, AlertCircle } from "lucide-react";

type Review = {
  id: string;
  rating: number;
  comment: string | null;
  createdAt: string;
  reviewer: { clerkUserId: string; name: string };
};

export default function RatingWidget({
  providerId,
  isOwnProfile,
  onRatingUpdate,
}: {
  providerId: number;
  isOwnProfile: boolean;
  onRatingUpdate: (newRating: number) => void;
}) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  const [myRating, setMyRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [myComment, setMyComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchReviews = async () => {
    try {
      const res = await fetch(`/api/providers/${providerId}/reviews`);
      const data = await res.json();
      setReviews(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [providerId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (myRating === 0) return;

    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch(`/api/providers/${providerId}/reviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating: myRating, comment: myComment }),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        setError(data?.error ?? "Failed to submit review");
        return;
      }

      onRatingUpdate(data.rating);
      setMyRating(0);
      setMyComment("");
      await fetchReviews();
    } catch (err) {
      console.error(err);
      setError("Failed to submit review");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Reviews</h2>

      {!isOwnProfile && (
        <form
          onSubmit={handleSubmit}
          className="mb-6 pb-6 border-b border-gray-100"
        >
          {error && (
            <div className="flex items-start gap-2 rounded-xl bg-red-50 border border-red-200 p-3 text-red-700 text-sm mb-3">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              {error}
            </div>
          )}

          <p className="text-sm text-gray-600 mb-2">Leave a rating</p>
          <div
            className="flex gap-1 mb-3"
            onMouseLeave={() => setHoverRating(0)}
          >
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => setMyRating(n)}
                onMouseEnter={() => setHoverRating(n)}
                className="p-0.5"
              >
                <Star
                  className={`w-6 h-6 transition-colors ${
                    n <= (hoverRating || myRating)
                      ? "text-yellow-500 fill-yellow-500"
                      : "text-gray-300"
                  }`}
                />
              </button>
            ))}
          </div>

          <textarea
            value={myComment}
            onChange={(e) => setMyComment(e.target.value)}
            placeholder="Optional comment..."
            rows={2}
            className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-700 resize-none"
          />

          <button
            type="submit"
            disabled={submitting || myRating === 0}
            className="mt-3 px-4 py-2 rounded-xl bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition disabled:opacity-60"
          >
            {submitting ? "Submitting..." : "Submit Rating"}
          </button>
        </form>
      )}

      {loading ? (
        <div className="space-y-3">
          {[1, 2].map((i) => (
            <div
              key={i}
              className="h-14 rounded-xl bg-gray-100 animate-pulse"
            />
          ))}
        </div>
      ) : reviews.length === 0 ? (
        <p className="text-sm text-gray-500">No reviews yet.</p>
      ) : (
        <div className="space-y-4">
          {reviews.map((r) => (
            <div
              key={r.id}
              className="border-b border-gray-50 last:border-0 pb-4 last:pb-0"
            >
              <div className="flex items-center justify-between">
                <p className="font-medium text-gray-900 text-sm">
                  {r.reviewer.name}
                </p>
                <div className="flex gap-0.5">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <Star
                      key={n}
                      className={`w-3.5 h-3.5 ${
                        n <= r.rating
                          ? "text-yellow-500 fill-yellow-500"
                          : "text-gray-200"
                      }`}
                    />
                  ))}
                </div>
              </div>
              {r.comment && (
                <p className="text-sm text-gray-600 mt-1">{r.comment}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
