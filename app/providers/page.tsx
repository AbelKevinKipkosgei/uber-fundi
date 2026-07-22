"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { useEffect, useMemo, useState } from "react";
import {
  Wrench,
  Zap,
  Hammer,
  Construction,
  Sparkles,
  Refrigerator,
  Sofa,
  Tv,
  ChevronDown,
  MapPin,
  Star,
  MessageCircle,
  Layers,
} from "lucide-react";
import { whatsappLink } from "@/lib/whatsapp";

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
  imageUrl: string | null;
  distance: number;
  rating: number;
  category?: { name: string };
};

const ICONS: Record<string, React.ElementType> = {
  plumbing: Wrench,
  electrical: Zap,
  "carpentry-woodwork": Hammer,
  "masonry-tiling": Construction,
  cleaning: Sparkles,
  "appliance-repair": Refrigerator,
  "interior-design-renovation": Sofa,
  "tv-mounting-home-tech": Tv,
};

const NEARBY_RADIUS_KM = 20;

function CategoryIcon({
  slug,
  className,
}: {
  slug: string;
  className?: string;
}) {
  const Icon = ICONS[slug] ?? Layers;
  return <Icon className={className} />;
}

export default function ProvidersPage() {
  const router = useRouter();
  const { isSignedIn } = useUser();

  const [categories, setCategories] = useState<Category[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);

  const [hoveredSlug, setHoveredSlug] = useState<string | null>(null);
  const [expandedSlug, setExpandedSlug] = useState<string | null>(null);

  const [providers, setProviders] = useState<Provider[]>([]);
  const [providersLoading, setProvidersLoading] = useState(true);
  const [locationDenied, setLocationDenied] = useState(false);

  const [startingChatId, setStartingChatId] = useState<number | null>(null);
  const [contactError, setContactError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch("/api/categories");
        const data = await res.json();
        setCategories(data);
      } catch (error) {
        console.error("Failed to load categories", error);
      } finally {
        setCategoriesLoading(false);
      }
    };

    fetchCategories();
  }, []);

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const res = await fetch(
            `/api/providers/nearby?lat=${pos.coords.latitude}&lng=${pos.coords.longitude}&radius=${NEARBY_RADIUS_KM}`,
          );

          const contentType = res.headers.get("content-type");

          if (!res.ok || !contentType?.includes("application/json")) {
            console.error("API failed or returned HTML:", await res.text());
            return;
          }

          const data = await res.json();
          setProviders(data);
        } catch (error) {
          console.error(error);
        } finally {
          setProvidersLoading(false);
        }
      },
      () => {
        setLocationDenied(true);
        setProvidersLoading(false);
      },
    );
  }, []);

  const hoveredCategory = useMemo(
    () => categories.find((c) => c.slug === hoveredSlug) ?? null,
    [categories, hoveredSlug],
  );

  const handleMessage = async (providerId: number) => {
    if (!isSignedIn) {
      router.push("/sign-in");
      return;
    }

    setStartingChatId(providerId);
    setContactError(null);

    try {
      const res = await fetch("/api/conversations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ providerId }),
      });

      const data = await res.json();

      if (res.ok) {
        router.push(`/messages/${data.conversationId}`);
      } else {
        setContactError(data.error ?? "Failed to start conversation");
      }
    } catch (err) {
      console.error(err);
      setContactError("Failed to start conversation");
    } finally {
      setStartingChatId(null);
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 via-white to-blue-50">
      {/* HEADER */}
      <div className="max-w-7xl mx-auto px-6 pt-16 pb-10">
        <h1 className="text-4xl font-bold text-gray-900">
          Browse Service Categories
        </h1>
        <p className="mt-3 text-gray-600 max-w-2xl">
          Find skilled professionals by category and discover providers closest
          to your location.
        </p>
      </div>

      {/* CATEGORY BROWSER — unchanged */}
      <div className="max-w-7xl mx-auto px-6 pb-16">
        {categoriesLoading ? (
          <div className="grid gap-3">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="h-14 rounded-xl bg-white animate-pulse border"
              />
            ))}
          </div>
        ) : (
          <>
            <div
              className="hidden md:flex rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden"
              onMouseLeave={() => setHoveredSlug(null)}
            >
              <nav className="w-72 shrink-0 border-r border-gray-100 py-2">
                {categories.map((category) => {
                  const isActive = hoveredSlug === category.slug;
                  return (
                    <Link
                      key={category.id}
                      href={`/providers/${category.slug}`}
                      onMouseEnter={() => setHoveredSlug(category.slug)}
                      onFocus={() => setHoveredSlug(category.slug)}
                      className={`flex items-center gap-3 px-5 py-3.5 text-sm font-medium transition-colors ${
                        isActive
                          ? "bg-blue-50 text-blue-700"
                          : "text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      <CategoryIcon
                        slug={category.slug}
                        className={`w-5 h-5 shrink-0 ${
                          isActive ? "text-blue-600" : "text-gray-400"
                        }`}
                      />
                      <span className="flex-1">{category.name}</span>
                      <span className="text-xs text-gray-400">
                        {category.children.length}
                      </span>
                    </Link>
                  );
                })}
              </nav>

              <div className="flex-1 p-8">
                {hoveredCategory ? (
                  <div>
                    <div className="flex items-center gap-3 mb-5">
                      <div className="w-11 h-11 rounded-xl bg-blue-50 flex items-center justify-center">
                        <CategoryIcon
                          slug={hoveredCategory.slug}
                          className="w-6 h-6 text-blue-600"
                        />
                      </div>
                      <div>
                        <h2 className="text-lg font-semibold text-gray-900">
                          {hoveredCategory.name}
                        </h2>
                        <p className="text-sm text-gray-500">
                          {hoveredCategory.children.length} services available
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      {hoveredCategory.children.map((sub) => (
                        <Link
                          key={sub.id}
                          href={`/providers/${hoveredCategory.slug}?sub=${sub.slug}`}
                          className="px-4 py-2.5 rounded-lg text-sm text-gray-700 border border-gray-100 hover:border-blue-200 hover:bg-blue-50/50 transition-colors"
                        >
                          {sub.name}
                        </Link>
                      ))}
                    </div>

                    <Link
                      href={`/providers/${hoveredCategory.slug}`}
                      className="inline-block mt-6 text-sm font-medium text-blue-600 hover:text-blue-700"
                    >
                      View all {hoveredCategory.name} providers →
                    </Link>
                  </div>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-center py-10">
                    <Layers className="w-8 h-8 text-gray-300 mb-3" />
                    <p className="text-sm text-gray-400">
                      Hover a category to see its services
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="md:hidden rounded-2xl border border-gray-100 bg-white shadow-sm divide-y divide-gray-100 overflow-hidden">
              {categories.map((category) => {
                const isOpen = expandedSlug === category.slug;
                return (
                  <div key={category.id}>
                    <button
                      type="button"
                      onClick={() =>
                        setExpandedSlug(isOpen ? null : category.slug)
                      }
                      className="w-full flex items-center gap-3 px-5 py-4 text-left"
                    >
                      <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
                        <CategoryIcon
                          slug={category.slug}
                          className="w-5 h-5 text-blue-600"
                        />
                      </div>
                      <span className="flex-1 font-medium text-gray-900">
                        {category.name}
                      </span>
                      <ChevronDown
                        className={`w-4 h-4 text-gray-400 transition-transform ${
                          isOpen ? "rotate-180" : ""
                        }`}
                      />
                    </button>

                    {isOpen && (
                      <div className="px-5 pb-4">
                        <div className="grid grid-cols-2 gap-2 mb-3">
                          {category.children.map((sub) => (
                            <Link
                              key={sub.id}
                              href={`/providers/${category.slug}?sub=${sub.slug}`}
                              className="px-3 py-2 rounded-lg text-sm text-gray-700 bg-gray-50 active:bg-blue-50"
                            >
                              {sub.name}
                            </Link>
                          ))}
                        </div>
                        <Link
                          href={`/providers/${category.slug}`}
                          className="text-sm font-medium text-blue-600"
                        >
                          View all {category.name} providers →
                        </Link>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* NEARBY PROVIDERS */}
      <div className="max-w-7xl mx-auto px-6 pb-20">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-3xl font-bold text-gray-900">Nearby Providers</h2>
          <div className="text-sm text-gray-500">Sorted by distance</div>
        </div>
        <p className="text-sm text-gray-400 mb-8">
          Showing providers within {NEARBY_RADIUS_KM} km of your location
        </p>

        {contactError && (
          <p className="mb-6 text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
            {contactError}
          </p>
        )}

        {providersLoading ? (
          <div className="grid md:grid-cols-3 gap-6">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="h-56 rounded-2xl bg-white animate-pulse border"
              />
            ))}
          </div>
        ) : locationDenied ? (
          <div className="bg-white rounded-2xl border p-12 text-center shadow-sm">
            <MapPin className="w-10 h-10 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900">
              Location access needed
            </h3>
            <p className="mt-2 text-gray-500">
              Enable location access to see providers near you.
            </p>
          </div>
        ) : providers.length === 0 ? (
          <div className="bg-white rounded-2xl border p-12 text-center shadow-sm">
            <MapPin className="w-10 h-10 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900">
              No providers found nearby
            </h3>
            <p className="mt-2 text-gray-500">
              No providers within {NEARBY_RADIUS_KM} km yet. Be the first in
              your area.
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {providers.map((provider) => (
              <div
                key={provider.id}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 p-6"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-full bg-blue-100 text-blue-700 font-semibold flex items-center justify-center shrink-0 overflow-hidden">
                      {provider.imageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={provider.imageUrl}
                          alt={provider.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        provider.name.charAt(0).toUpperCase()
                      )}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {provider.name}
                      </h3>
                      <p className="text-blue-600 text-sm font-medium">
                        {provider.category?.name ?? "Service Provider"}
                      </p>
                    </div>
                  </div>
                  <span className="px-3 py-1 text-xs rounded-full bg-green-100 text-green-700 shrink-0">
                    Available
                  </span>
                </div>

                {provider.bio && (
                  <p className="mt-3 text-sm text-gray-600 line-clamp-2">
                    {provider.bio}
                  </p>
                )}

                <div className="mt-4 flex items-center gap-3 text-sm text-gray-500">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5" />
                    {Number(provider.distance).toFixed(1)} km away
                  </span>
                  <span className="flex items-center gap-1">
                    <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" />
                    {provider.rating ?? 0}
                  </span>
                </div>

                <div className="mt-5 flex gap-2">
                  <button
                    onClick={() => handleMessage(provider.id)}
                    disabled={startingChatId === provider.id}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl bg-blue-600 text-white py-2.5 text-sm font-medium hover:bg-blue-700 transition disabled:opacity-60"
                  >
                    <MessageCircle className="w-4 h-4" />
                    {startingChatId === provider.id ? "Starting..." : "Message"}
                  </button>
                  <a
                    href={whatsappLink(provider.phone, provider.name)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl bg-green-600 text-white py-2.5 text-sm font-medium hover:bg-green-700 transition"
                  >
                    <MessageCircle className="w-4 h-4" />
                    WhatsApp
                  </a>
                </div>

                <Link
                  href={`/provider/${provider.id}`}
                  className="block mt-3 text-center text-xs text-gray-400 hover:text-blue-600 transition"
                >
                  View full profile
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="text-center pb-16">
        <p className="text-gray-500 text-sm">
          Can&apos;t find what you need? More categories coming soon.
        </p>
      </div>
    </div>
  );
}
