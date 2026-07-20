"use client";

import Link from "next/link";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Phone, Star, MapPin, ArrowLeft } from "lucide-react";

type Subcategory = {
  id: string;
  name: string;
  slug: string;
};

type Category = {
  id: string;
  name: string;
  slug: string;
  children: Subcategory[];
};

type Provider = {
  id: number;
  name: string;
  phone: string;
  bio: string | null;
  rating: number | null;
  isAvailable: boolean | null;
  category: { name: string };
  subcategories: { category: { id: string; name: string; slug: string } }[];
};

export default function CategoryDetailPage() {
  const params = useParams<{ category: string }>();
  const searchParams = useSearchParams();
  const router = useRouter();

  const categorySlug = params.category;
  const activeSub = searchParams.get("sub");

  const [category, setCategory] = useState<Category | null>(null);
  const [providers, setProviders] = useState<Provider[]>([]);
  const [nextCursor, setNextCursor] = useState<number | null>(null);
  const [loadingMore, setLoadingMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCategory = async () => {
      try {
        const res = await fetch("/api/categories");
        const data: Category[] = await res.json();
        const match = data.find((c) => c.slug === categorySlug);
        setCategory(match ?? null);
      } catch (err) {
        console.error("Failed to load category", err);
      }
    };

    fetchCategory();
  }, [categorySlug]);

  useEffect(() => {
    const fetchProviders = async () => {
      setLoading(true);
      setError(null);

      try {
        const url = activeSub
          ? `/api/providers/category/${categorySlug}?sub=${activeSub}`
          : `/api/providers/category/${categorySlug}`;

        const res = await fetch(url);

        if (!res.ok) {
          const data = await res.json().catch(() => null);
          setError(data?.error ?? "Failed to load providers");
          setProviders([]);
          return;
        }

        const data = await res.json();
        setProviders(data.providers);
        setNextCursor(data.nextCursor);
      } catch (err) {
        console.error(err);
        setError("Failed to load providers");
      } finally {
        setLoading(false);
      }
    };

    fetchProviders();
  }, [categorySlug, activeSub]);

  const loadMoreProviders = async () => {
    if (!nextCursor) return;
    setLoadingMore(true);

    try {
      const url = activeSub
        ? `/api/providers/category/${categorySlug}?sub=${activeSub}&cursor=${nextCursor}`
        : `/api/providers/category/${categorySlug}?cursor=${nextCursor}`;

      const res = await fetch(url);
      const data = await res.json();

      setProviders((prev) => [...prev, ...data.providers]);
      setNextCursor(data.nextCursor);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingMore(false);
    }
  };

  const selectSubcategory = (slug: string | null) => {
    const url = slug
      ? `/providers/${categorySlug}?sub=${slug}`
      : `/providers/${categorySlug}`;
    router.push(url);
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 via-white to-blue-50">
      <div className="max-w-6xl mx-auto px-6 pt-12 pb-10">
        <Link
          href="/providers"
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          All categories
        </Link>

        <h1 className="text-3xl font-bold text-gray-900">
          {category?.name ?? "Loading..."}
        </h1>
        <p className="mt-2 text-gray-600">
          Browse trusted providers, or narrow down by specific service.
        </p>

        {category && category.children.length > 0 && (
          <div className="mt-6 flex flex-wrap gap-2">
            <button
              onClick={() => selectSubcategory(null)}
              className={`px-4 py-2 rounded-full text-sm font-medium border transition-colors ${
                !activeSub
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-white text-gray-600 border-gray-200 hover:border-blue-200"
              }`}
            >
              All {category.name}
            </button>

            {category.children.map((sub) => (
              <button
                key={sub.id}
                onClick={() => selectSubcategory(sub.slug)}
                className={`px-4 py-2 rounded-full text-sm font-medium border transition-colors ${
                  activeSub === sub.slug
                    ? "bg-blue-600 text-white border-blue-600"
                    : "bg-white text-gray-600 border-gray-200 hover:border-blue-200"
                }`}
              >
                {sub.name}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="max-w-6xl mx-auto px-6 pb-20">
        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-56 rounded-2xl bg-white animate-pulse border"
              />
            ))}
          </div>
        ) : error ? (
          <div className="bg-white rounded-2xl border p-12 text-center shadow-sm">
            <p className="text-gray-500">{error}</p>
          </div>
        ) : providers.length === 0 ? (
          <div className="bg-white rounded-2xl border p-12 text-center shadow-sm">
            <h3 className="text-xl font-semibold text-gray-900">
              No providers found
            </h3>
            <p className="mt-2 text-gray-500">
              {activeSub
                ? "No one currently offers this specific service. Try browsing the full category instead."
                : "Be the first provider in this category."}
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {providers.map((provider) => (
              <Link
                key={provider.id}
                href={`/provider/${provider.id}`}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 p-6"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">
                      {provider.name}
                    </h3>
                    <p className="text-blue-600 font-medium">
                      {provider.category.name}
                    </p>
                  </div>
                  {provider.isAvailable && (
                    <span className="px-3 py-1 text-xs rounded-full bg-green-100 text-green-700">
                      Available
                    </span>
                  )}
                </div>

                {provider.bio && (
                  <p className="mt-3 text-sm text-gray-600 line-clamp-2">
                    {provider.bio}
                  </p>
                )}

                {provider.subcategories.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {provider.subcategories.map(({ category: sub }) => (
                      <span
                        key={sub.id}
                        className="px-2.5 py-1 text-xs rounded-full bg-gray-100 text-gray-600"
                      >
                        {sub.name}
                      </span>
                    ))}
                  </div>
                )}

                <div className="mt-5 space-y-2 text-sm text-gray-600">
                  <p className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-gray-400" />
                    {provider.phone}
                  </p>
                  <p className="flex items-center gap-2">
                    <Star className="w-4 h-4 text-gray-400" />
                    {provider.rating ?? 0}
                  </p>
                </div>

                <div className="mt-6 text-sm font-medium text-blue-600">
                  View profile →
                </div>
              </Link>
            ))}
            {nextCursor && (
              <div className="mt-8 text-center">
                <button
                  onClick={loadMoreProviders}
                  disabled={loadingMore}
                  className="px-6 py-2.5 rounded-xl border border-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-50 transition disabled:opacity-60"
                >
                  {loadingMore ? "Loading..." : "Load more providers"}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
