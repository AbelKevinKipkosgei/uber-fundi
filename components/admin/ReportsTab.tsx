"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, XCircle, Clock } from "lucide-react";

type Report = {
  id: string;
  reason: string;
  details: string | null;
  status: string;
  createdAt: string;
  reporter: { name: string };
  reportedUser: { name: string };
};

const STATUS_STYLES: Record<string, string> = {
  PENDING: "bg-yellow-50 text-yellow-700",
  RESOLVED: "bg-green-50 text-green-700",
  DISMISSED: "bg-gray-100 text-gray-600",
};

export default function ReportsTab() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("PENDING");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const url = filter
        ? `/api/admin/reports?status=${filter}`
        : "/api/admin/reports";
      const res = await fetch(url);
      const data = await res.json();
      setReports(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  const updateStatus = async (id: string, status: string) => {
    setUpdatingId(id);
    try {
      const res = await fetch(`/api/admin/reports/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        setReports((prev) => prev.filter((r) => r.id !== id));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div>
      <div className="flex gap-2 mb-4">
        {["PENDING", "RESOLVED", "DISMISSED", ""].map((s) => (
          <button
            key={s || "ALL"}
            onClick={() => setFilter(s)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition ${
              filter === s
                ? "bg-blue-600 text-white"
                : "bg-white border border-gray-200 text-gray-600 hover:border-blue-200"
            }`}
          >
            {s || "All"}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2].map((i) => (
            <div
              key={i}
              className="h-20 rounded-2xl bg-gray-100 animate-pulse"
            />
          ))}
        </div>
      ) : reports.length === 0 ? (
        <p className="text-sm text-gray-500 text-center py-10">
          No reports found.
        </p>
      ) : (
        <div className="space-y-3">
          {reports.map((r) => (
            <div
              key={r.id}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${STATUS_STYLES[r.status]}`}
                  >
                    <Clock className="w-3 h-3" />
                    {r.status}
                  </span>
                  <p className="mt-2 text-sm text-gray-900">
                    <span className="font-medium">{r.reporter.name}</span>{" "}
                    reported{" "}
                    <span className="font-medium">{r.reportedUser.name}</span>
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    Reason: {r.reason.replace(/_/g, " ")}
                  </p>
                  {r.details && (
                    <p className="text-sm text-gray-500 mt-1">{r.details}</p>
                  )}
                  <p className="text-xs text-gray-400 mt-2">
                    {new Date(r.createdAt).toLocaleString()}
                  </p>
                </div>

                {r.status === "PENDING" && (
                  <div className="flex gap-2 shrink-0">
                    <button
                      onClick={() => updateStatus(r.id, "RESOLVED")}
                      disabled={updatingId === r.id}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-green-600 text-white text-xs font-medium hover:bg-green-700 transition disabled:opacity-60"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Resolve
                    </button>
                    <button
                      onClick={() => updateStatus(r.id, "DISMISSED")}
                      disabled={updatingId === r.id}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-xl border border-gray-200 text-gray-600 text-xs font-medium hover:bg-gray-50 transition disabled:opacity-60"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      Dismiss
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
