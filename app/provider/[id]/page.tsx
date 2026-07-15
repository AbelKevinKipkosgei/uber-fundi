"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Phone,
  Star,
  ArrowLeft,
  MessageCircle,
  BadgeCheck,
  Wrench,
  Zap,
  Hammer,
  Construction,
  Sparkles,
  Refrigerator,
  Sofa,
  Tv,
  Layers,
} from "lucide-react";

type Subcategory = { id: string; name: string; slug: string };

type Provider = {
  id: number;
  name: string;
  phone: string;
  bio: string | null;
  rating: number | null;
  isAvailable: boolean | null;
  createdAt: string;
  category: { id: string; name: string; slug: string };
  subcategories: { category: Subcategory }[];
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

// WhatsApp Link
function toInternationalKenyanNumber(phone: string): string {
  const digitsOnly = phone.replace(/[^\d]/g, "");

  if (digitsOnly.startsWith("254")) return digitsOnly;
  if (digitsOnly.startsWith("0")) return `254${digitsOnly.slice(1)}`;

  return digitsOnly; // fallback — assume already correctly formatted
}

function whatsappLink(phone: string, providerName: string) {
  const normalized = toInternationalKenyanNumber(phone);
  const message = encodeURIComponent(
    `Hi ${providerName}, I found your profile on UberFundi and I'd like to enquire about your services.`,
  );
  return `https://wa.me/${normalized}?text=${message}`;
}

export default function ProviderProfilePage() {
  const params = useParams<{ id: string }>();
  const [provider, setProvider] = useState<Provider | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProvider = async () => {
      try {
        const res = await fetch(`/api/providers/${params.id}`);

        if (!res.ok) {
          const data = await res.json().catch(() => null);
          setError(data?.error ?? "Failed to load provider");
          return;
        }

        const data = await res.json();
        setProvider(data);
      } catch (err) {
        console.error(err);
        setError("Failed to load provider");
      } finally {
        setLoading(false);
      }
    };

    fetchProvider();
  }, [params.id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-gray-50 via-white to-blue-50 px-6 py-14">
        <div className="max-w-3xl mx-auto space-y-6">
          <div className="h-8 w-40 bg-white rounded-lg animate-pulse border" />
          <div className="h-64 rounded-3xl bg-white animate-pulse border" />
        </div>
      </div>
    );
  }

  if (error || !provider) {
    return (
      <div className="min-h-screen bg-linear-to-br from-gray-50 via-white to-blue-50 flex items-center justify-center px-6">
        <div className="bg-white rounded-2xl border p-12 text-center shadow-sm max-w-md">
          <h2 className="text-xl font-semibold text-gray-900">
            {error ?? "Provider not found"}
          </h2>
          <Link
            href="/providers"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-blue-600 hover:text-blue-700 mt-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to categories
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 via-white to-blue-50">
      <div className="max-w-3xl mx-auto px-6 pt-12 pb-20">
        <Link
          href={`/providers/${provider.category.slug}`}
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to {provider.category.name}
        </Link>

        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8">
          <div className="flex items-start gap-5">
            <div className="w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center shrink-0">
              <CategoryIcon
                slug={provider.category.slug}
                className="w-8 h-8 text-blue-600"
              />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl font-bold text-gray-900">
                  {provider.name}
                </h1>
                {provider.isAvailable && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-green-100 text-green-700 text-xs font-medium">
                    <BadgeCheck className="w-3.5 h-3.5" />
                    Available
                  </span>
                )}
              </div>

              <p className="text-blue-600 font-medium mt-1">
                {provider.category.name}
              </p>

              <div className="flex items-center gap-1.5 mt-2 text-sm text-gray-500">
                <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                <span>{provider.rating ?? 0}</span>
                <span className="text-gray-300">·</span>
                <span>
                  Joined{" "}
                  {new Date(provider.createdAt).toLocaleDateString("en-KE", {
                    month: "long",
                    year: "numeric",
                  })}
                </span>
              </div>
            </div>
          </div>

          {provider.bio && (
            <p className="mt-6 text-gray-700 leading-relaxed">{provider.bio}</p>
          )}

          {provider.subcategories.length > 0 && (
            <div className="mt-6">
              <p className="text-sm font-medium text-gray-500 mb-2">
                Services offered
              </p>
              <div className="flex flex-wrap gap-2">
                {provider.subcategories.map(({ category: sub }) => (
                  <span
                    key={sub.id}
                    className="px-3 py-1.5 rounded-full bg-gray-100 text-gray-700 text-sm"
                  >
                    {sub.name}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="mt-8 flex flex-col sm:flex-row gap-3">
            <Link
              href={whatsappLink(provider.phone, provider.name)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-green-600 text-white py-3 font-medium hover:bg-green-700 transition"
            >
              <MessageCircle className="w-5 h-5" />
              Message on WhatsApp
            </Link>

            <Link
              href={`tel:${provider.phone}`}
              className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 text-gray-700 py-3 font-medium hover:bg-gray-50 transition"
            >
              <Phone className="w-5 h-5" />
              {provider.phone}
            </Link>
          </div>
        </div>

        <div className="mt-8 bg-white rounded-3xl border border-gray-100 shadow-sm p-8 text-center">
          <h2 className="text-lg font-semibold text-gray-900">Recent Work</h2>
          <p className="mt-2 text-sm text-gray-500">
            {provider.name.split(" ")[0]} hasn&apos;t posted any work yet.
          </p>
        </div>
      </div>
    </div>
  );
}
