"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Search, X, Star, ArrowRight } from "lucide-react";
import { useDebounce } from "@/lib/useDebounce";

type Provider = {
  id: number;
  name: string;
  bio: string | null;
  rating: number | null;
  category: { name: string };
};

const PREVIEW_LIMIT = 5;

export default function SearchOverlay({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebounce(query);

  const [results, setResults] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onClose]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        overlayRef.current &&
        !overlayRef.current.contains(e.target as Node)
      ) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  useEffect(() => {
    if (debouncedQuery.trim().length < 2) {
      setResults([]);
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
        setResults((data.providers ?? []).slice(0, PREVIEW_LIMIT));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    search();
  }, [debouncedQuery]);

  const handleSeeAll = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    router.push(`/search?q=${encodeURIComponent(query)}`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-80 bg-black/40 flex items-start justify-center pt-20 px-4">
      <div
        ref={overlayRef}
        className="bg-white rounded-2xl shadow-xl w-full max-w-xl overflow-hidden"
      >
        <form
          onSubmit={handleSeeAll}
          className="flex items-center gap-3 px-5 py-4 border-b border-gray-100"
        >
          <Search className="w-5 h-5 text-gray-400 shrink-0" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search providers by name, service, or specialty..."
            className="flex-1 outline-none text-sm text-gray-700"
          />
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </form>

        <div className="max-h-96 overflow-y-auto">
          {loading ? (
            <div className="p-5 space-y-3">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-14 rounded-xl bg-gray-100 animate-pulse"
                />
              ))}
            </div>
          ) : !hasSearched ? (
            <p className="text-sm text-gray-400 text-center py-10">
              Start typing to find a provider.
            </p>
          ) : results.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-10">
              No providers found for &quot;{debouncedQuery}&quot;.
            </p>
          ) : (
            <div className="py-2">
              {results.map((provider) => (
                <Link
                  key={provider.id}
                  href={`/provider/${provider.id}`}
                  onClick={onClose}
                  className="flex items-center gap-3 px-5 py-3 hover:bg-gray-50 transition"
                >
                  <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-700 font-semibold flex items-center justify-center shrink-0 text-sm">
                    {provider.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-gray-900 text-sm truncate">
                      {provider.name}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {provider.category.name}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-gray-400 shrink-0">
                    <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" />
                    {provider.rating ?? 0}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {hasSearched && results.length > 0 && (
          <button
            onClick={handleSeeAll}
            className="w-full flex items-center justify-center gap-1.5 px-5 py-3 text-sm font-medium text-blue-600 hover:bg-blue-50 transition border-t border-gray-100"
          >
            See all results for &quot;{query}&quot;
            <ArrowRight className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}
