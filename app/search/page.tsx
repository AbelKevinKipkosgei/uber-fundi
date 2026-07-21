"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Search as SearchIcon, MapPin, Star } from "lucide-react";
import { useDebounce } from "@/lib/useDebounce";

type Provider = {
  id: number;
  name: string;
  bio: string | null;
  rating: number | null;
  isAvailable: boolean | null;
  category: { name: string };
};

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebounce(query, 400);

  const [providers, setProviders] = useState<Provider[]>([]);
  const [nextCursor, setNextCursor] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    if (debouncedQuery.trim().length < 2) {
      setProviders([]);
      setNextCursor(null);
      setHasSearched(false);
      return;
    }

    const search = async () => {
      setLoading(true);
      setHasSearched(true);
      try {
        const res = await fetch(
          `/api/search/providers?q=${encodeURIComponent(debouncedQuery)}`,
        );
        const data = await res.json();
        setProviders(data.providers ?? []);
        setNextCursor(data.nextCursor ?? null);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    search();
  }, [debouncedQuery]);

  const loadMore = async () => {
    if (!nextCursor) return;
    setLoadingMore(true);
    try {
      const res = await fetch(
        `/api/search/providers?q=${encodeURIComponent(debouncedQuery)}&cursor=${nextCursor}`,
      );
      const data = await res.json();
      setProviders((prev) => [...prev, ...(data.providers ?? [])]);
      setNextCursor(data.nextCursor ?? null);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingMore(false);
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 via-white to-blue-50">
      <div className="max-w-4xl mx-auto px-6 pt-12 pb-20">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">
          Search Providers
        </h1>

        <div className="relative mb-8">
          <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name, service, or specialty..."
            autoFocus
            className="w-full pl-12 pr-4 py-4 rounded-2xl border border-gray-200 bg-white shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition text-gray-700"
          />
        </div>

        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-40 rounded-2xl bg-white animate-pulse border"
              />
            ))}
          </div>
        ) : !hasSearched ? (
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-12 text-center">
            <SearchIcon className="w-8 h-8 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">
              Start typing to search for a provider.
            </p>
          </div>
        ) : providers.length === 0 ? (
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-12 text-center">
            <p className="text-gray-500">
              No providers found for &quot;{debouncedQuery}&quot;.
            </p>
          </div>
        ) : (
          <>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {providers.map((provider) => (
                <Link
                  key={provider.id}
                  href={`/provider/${provider.id}`}
                  className="block bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 p-6"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {provider.name}
                      </h3>
                      <p className="text-blue-600 text-sm font-medium">
                        {provider.category.name}
                      </p>
                    </div>
                    {provider.isAvailable && (
                      <span className="px-2.5 py-1 text-xs rounded-full bg-green-100 text-green-700">
                        Available
                      </span>
                    )}
                  </div>

                  {provider.bio && (
                    <p className="mt-3 text-sm text-gray-600 line-clamp-2">
                      {provider.bio}
                    </p>
                  )}

                  <div className="flex items-center gap-1 mt-4 text-sm text-gray-500">
                    <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                    {provider.rating ?? 0}
                  </div>
                </Link>
              ))}
            </div>

            {nextCursor && (
              <div className="mt-8 text-center">
                <button
                  onClick={loadMore}
                  disabled={loadingMore}
                  className="px-6 py-2.5 rounded-xl border border-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-50 transition disabled:opacity-60"
                >
                  {loadingMore ? "Loading..." : "Load more"}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
