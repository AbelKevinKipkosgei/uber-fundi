"use client";

import { useEffect, useState } from "react";
import { Ban, CheckCircle2 } from "lucide-react";

type Provider = {
  id: number;
  name: string;
  phone: string;
  rating: number | null;
  suspended: boolean;
  category: { name: string };
};

export default function ProvidersTab() {
  const [providers, setProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(true);
  const [togglingId, setTogglingId] = useState<number | null>(null);

  const fetchProviders = async () => {
    try {
      const res = await fetch("/api/admin/providers");
      const data = await res.json();
      setProviders(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProviders();
  }, []);

  const toggleSuspend = async (id: number) => {
    setTogglingId(id);
    try {
      const res = await fetch(`/api/admin/providers/${id}/suspend`, {
        method: "PATCH",
      });
      if (res.ok) {
        const updated = await res.json();
        setProviders((prev) =>
          prev.map((p) =>
            p.id === id ? { ...p, suspended: updated.suspended } : p,
          ),
        );
      }
    } catch (err) {
      console.error(err);
    } finally {
      setTogglingId(null);
    }
  };

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-16 rounded-2xl bg-gray-100 animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm divide-y divide-gray-100 overflow-hidden">
      {providers.map((p) => (
        <div key={p.id} className="flex items-center justify-between px-5 py-4">
          <div>
            <p className="font-medium text-gray-900">{p.name}</p>
            <p className="text-xs text-gray-500">
              {p.category.name} · {p.phone} · ★ {p.rating ?? 0}
            </p>
          </div>
          <div className="flex items-center gap-3">
            {p.suspended && (
              <span className="px-2.5 py-1 rounded-full bg-red-50 text-red-600 text-xs font-medium">
                Suspended
              </span>
            )}
            <button
              onClick={() => toggleSuspend(p.id)}
              disabled={togglingId === p.id}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-medium transition disabled:opacity-60 ${
                p.suspended
                  ? "bg-green-600 text-white hover:bg-green-700"
                  : "border border-red-200 text-red-600 hover:bg-red-50"
              }`}
            >
              {p.suspended ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Reinstate
                </>
              ) : (
                <>
                  <Ban className="w-3.5 h-3.5" />
                  Suspend
                </>
              )}
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
