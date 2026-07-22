"use client";

import { useEffect, useState } from "react";
import { Ban, CheckCircle2, Search } from "lucide-react";
import { useDebounce } from "@/lib/useDebounce";

type Provider = {
  id: number;
  name: string;
  phone: string;
  imageUrl: string | null;
  rating: number | null;
  suspended: boolean;
  category: { name: string };
};

export default function ProvidersTab() {
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebounce(query);

  const [providers, setProviders] = useState<Provider[]>([]);
  const [nextCursor, setNextCursor] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [togglingId, setTogglingId] = useState<number | null>(null);

  const fetchProviders = async (q: string) => {
    setLoading(true);
    try {
      const url = q
        ? `/api/admin/providers?query=${encodeURIComponent(q)}`
        : "/api/admin/providers";
      const res = await fetch(url);
      const data = await res.json();
      setProviders(data.providers ?? []);
      setNextCursor(data.nextCursor ?? null);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProviders(debouncedQuery);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedQuery]);

  const loadMore = async () => {
    if (!nextCursor) return;
    setLoadingMore(true);
    try {
      const url = debouncedQuery
        ? `/api/admin/providers?query=${encodeURIComponent(debouncedQuery)}&cursor=${nextCursor}`
        : `/api/admin/providers?cursor=${nextCursor}`;
      const res = await fetch(url);
      const data = await res.json();
      setProviders((prev) => [...prev, ...(data.providers ?? [])]);
      setNextCursor(data.nextCursor ?? null);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingMore(false);
    }
  };

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

  return (
    <div>
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by name, category, or phone..."
          className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-700"
        />
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-16 rounded-2xl bg-gray-100 animate-pulse"
            />
          ))}
        </div>
      ) : providers.length === 0 ? (
        <p className="text-sm text-gray-500 text-center py-10">
          No providers found.
        </p>
      ) : (
        <>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm divide-y divide-gray-100 overflow-hidden">
            {providers.map((p) => (
              <div
                key={p.id}
                className="flex items-center justify-between px-5 py-4"
              >
                {/* <div>
                  <p className="font-medium text-gray-900">{p.name}</p>
                  <p className="text-xs text-gray-500">
                    {p.category.name} · {p.phone} · ★ {p.rating ?? 0}
                  </p>
                </div> */}
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-700 font-semibold flex items-center justify-center shrink-0 overflow-hidden text-sm">
                    {p.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={p.imageUrl}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      p.name.charAt(0).toUpperCase()
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{p.name}</p>
                    <p className="text-xs text-gray-500">
                      {p.category.name} · {p.phone} · ★ {p.rating ?? 0}
                    </p>
                  </div>
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

          {nextCursor && (
            <div className="mt-4 text-center">
              <button
                onClick={loadMore}
                disabled={loadingMore}
                className="px-6 py-2 rounded-xl border border-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-50 transition disabled:opacity-60"
              >
                {loadingMore ? "Loading..." : "Load more"}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
