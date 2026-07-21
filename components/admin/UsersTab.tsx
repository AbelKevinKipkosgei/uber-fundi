"use client";

import { useEffect, useState } from "react";
import { Search, Ban, CheckCircle2 } from "lucide-react";
import { useDebounce } from "@/lib/useDebounce";

type AdminUser = {
  id: string;
  name: string;
  email: string | null;
  imageUrl: string;
  banned: boolean;
  createdAt: number;
};

export default function UsersTab() {
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebounce(query);

  const [users, setUsers] = useState<AdminUser[]>([]);
  const [nextOffset, setNextOffset] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = async (q: string) => {
    setLoading(true);
    try {
      const url = q
        ? `/api/admin/users?query=${encodeURIComponent(q)}`
        : "/api/admin/users";
      const res = await fetch(url);
      const data = await res.json();
      setUsers(data.users ?? []);
      setNextOffset(data.nextOffset ?? null);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers(debouncedQuery);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedQuery]);

  const loadMore = async () => {
    if (nextOffset === null) return;
    setLoadingMore(true);
    try {
      const url = debouncedQuery
        ? `/api/admin/users?query=${encodeURIComponent(debouncedQuery)}&offset=${nextOffset}`
        : `/api/admin/users?offset=${nextOffset}`;
      const res = await fetch(url);
      const data = await res.json();
      setUsers((prev) => [...prev, ...(data.users ?? [])]);
      setNextOffset(data.nextOffset ?? null);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingMore(false);
    }
  };

  const toggleBan = async (id: string) => {
    setTogglingId(id);
    setError(null);
    try {
      const res = await fetch(`/api/admin/users/${id}/ban`, {
        method: "PATCH",
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Failed to update ban status");
        return;
      }

      setUsers((prev) =>
        prev.map((u) => (u.id === id ? { ...u, banned: data.banned } : u)),
      );
    } catch (err) {
      console.error(err);
      setError("Failed to update ban status");
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
          placeholder="Search by name or email..."
          className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-700"
        />
      </div>

      {error && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-3 py-2 mb-4">
          {error}
        </p>
      )}

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-16 rounded-2xl bg-gray-100 animate-pulse"
            />
          ))}
        </div>
      ) : users.length === 0 ? (
        <p className="text-sm text-gray-500 text-center py-10">
          No users found.
        </p>
      ) : (
        <>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm divide-y divide-gray-100 overflow-hidden">
            {users.map((u) => (
              <div
                key={u.id}
                className="flex items-center justify-between px-5 py-4"
              >
                <div className="flex items-center gap-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={u.imageUrl}
                    alt=""
                    className="w-9 h-9 rounded-full"
                  />
                  <div>
                    <p className="font-medium text-gray-900 text-sm">
                      {u.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {u.email ?? "No email"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {u.banned && (
                    <span className="px-2.5 py-1 rounded-full bg-red-50 text-red-600 text-xs font-medium">
                      Banned
                    </span>
                  )}
                  <button
                    onClick={() => toggleBan(u.id)}
                    disabled={togglingId === u.id}
                    className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-medium transition disabled:opacity-60 ${
                      u.banned
                        ? "bg-green-600 text-white hover:bg-green-700"
                        : "border border-red-200 text-red-600 hover:bg-red-50"
                    }`}
                  >
                    {u.banned ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Unban
                      </>
                    ) : (
                      <>
                        <Ban className="w-3.5 h-3.5" />
                        Ban
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>

          {nextOffset !== null && (
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
