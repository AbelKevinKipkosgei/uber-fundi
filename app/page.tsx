"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  MapPinIcon,
  BoltIcon,
  ShieldCheckIcon,
  MagnifyingGlassIcon,
  ChatBubbleLeftRightIcon,
  CheckBadgeIcon,
  StarIcon,
  ChevronDownIcon,
} from "@heroicons/react/24/outline";
import {
  Wrench,
  Zap,
  Hammer,
  Construction,
  Sparkles,
  Refrigerator,
  Sofa,
  Tv,
  Layers,
  Users,
} from "lucide-react";

type Subcategory = { id: string; name: string; slug: string };
type Category = {
  id: string;
  name: string;
  slug: string;
  children: Subcategory[];
};

type FeaturedProvider = {
  id: number;
  name: string;
  bio: string | null;
  imageUrl: string | null;
  rating: number | null;
  category: { name: string };
};

type Stats = {
  providerCount: number;
  categoryCount: number;
  completedBookings: number;
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

const HOW_IT_WORKS = [
  {
    icon: MagnifyingGlassIcon,
    title: "Browse or search",
    desc: "Find a trusted fundi by category, or search directly for the exact service you need.",
  },
  {
    icon: ChatBubbleLeftRightIcon,
    title: "Message & agree",
    desc: "Chat in-app, agree on the job and price, and confirm a booking together.",
  },
  {
    icon: CheckBadgeIcon,
    title: "Pay & get it done",
    desc: "Pay securely with M-Pesa once you're ready, and mark the job complete when it's finished.",
  },
];

const FAQS = [
  {
    q: "How do I pay a provider?",
    a: "Once you and a provider agree on a job and price in chat, either of you can create a booking. Payment happens securely through M-Pesa directly on the booking page.",
  },
  {
    q: "Is my payment secure?",
    a: "Yes. Payments are processed directly through Safaricom's M-Pesa, and you only pay once you've agreed on the job - nothing is charged automatically.",
  },
  {
    q: "What if something goes wrong with a job?",
    a: "You can report a provider directly from their profile or from your conversation with them. Our team reviews every report.",
  },
  {
    q: "How do I become a provider?",
    a: 'Tap "Offer Services," create your profile with your category and specialties, and you\'re ready to start receiving bookings.',
  },
];

export default function HomePage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);

  const [featured, setFeatured] = useState<FeaturedProvider[]>([]);
  const [featuredLoading, setFeaturedLoading] = useState(true);

  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    fetch("/api/categories")
      .then((r) => r.json())
      .then((data) => setCategories(Array.isArray(data) ? data : []))
      .catch(console.error)
      .finally(() => setCategoriesLoading(false));
  }, []);

  useEffect(() => {
    fetch("/api/providers/featured")
      .then((r) => r.json())
      .then((data) => setFeatured(Array.isArray(data) ? data : []))
      .catch(console.error)
      .finally(() => setFeaturedLoading(false));
  }, []);

  useEffect(() => {
    fetch("/api/stats/public")
      .then((r) => r.json())
      .then(setStats)
      .catch(console.error);
  }, []);

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 via-white to-blue-50">
      {/* HERO */}
      <section className="max-w-6xl mx-auto px-6 pt-20 pb-16 text-center">
        <div className="inline-flex items-center px-4 py-1 rounded-full bg-blue-100 text-blue-700 text-sm font-medium mb-6">
          🔧 Find trusted local professionals instantly
        </div>

        <h1 className="text-5xl md:text-6xl font-bold tracking-tight text-gray-900">
          Hire Skilled
          <span className="text-blue-600"> Service Providers</span>
          <br />
          Near You
        </h1>

        <p className="mt-6 text-lg text-gray-600 max-w-2xl mx-auto">
          Connect with plumbers, electricians, cleaners, and technicians in your
          area. Chat, book, and pay securely with M-Pesa — all in one place.
        </p>

        <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/providers"
            className="px-6 py-3 rounded-xl bg-blue-600 text-white font-medium shadow-lg hover:bg-blue-700 transition"
          >
            Browse Providers
          </Link>

          <Link
            href="/add-provider"
            className="px-6 py-3 rounded-xl border border-gray-300 bg-white text-gray-700 font-medium hover:bg-gray-50 transition"
          >
            Offer Services
          </Link>
        </div>

        <p className="mt-4 text-sm text-gray-500">
          No signup required to browse • Free to get started
        </p>
      </section>

      {/* STATS BAR */}
      {stats && (
        <section className="max-w-4xl mx-auto px-6 pb-16">
          <div className="grid grid-cols-3 divide-x divide-gray-200 bg-white rounded-2xl border border-gray-100 shadow-sm py-6">
            <div className="text-center px-2">
              <div className="flex items-center justify-center gap-1.5 text-2xl md:text-3xl font-bold text-gray-500">
                <Users className="w-5 h-5 text-blue-600" />
                {stats.providerCount}
              </div>
              <p className="text-xs md:text-sm text-gray-500 mt-1">
                {stats.providerCount === 1 ? "Provider" : "Providers"}
              </p>
            </div>
            <div className="text-center px-2">
              <div className="flex items-center justify-center gap-1.5 text-2xl md:text-3xl font-bold text-gray-500">
                <Layers className="w-5 h-5 text-blue-600" />
                {stats.categoryCount}
              </div>
              <p className="text-xs md:text-sm text-gray-500 mt-1">
                Categories
              </p>
            </div>
            <div className="text-center px-2">
              <div className="flex items-center justify-center gap-1.5 text-2xl md:text-3xl font-bold text-gray-500">
                <CheckBadgeIcon className="w-5 h-5 text-blue-600" />
                {stats.completedBookings}
              </div>
              <p className="text-xs md:text-sm text-gray-500 mt-1">
                {stats.completedBookings === 1
                  ? "Job Completed"
                  : "Jobs Completed"}
              </p>
            </div>
          </div>
        </section>
      )}

      {/* HOW IT WORKS */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900">
            How UberFundi Works
          </h2>
          <p className="mt-3 text-gray-600">
            From finding help to getting paid - three simple steps.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {HOW_IT_WORKS.map((step, i) => (
            <div
              key={step.title}
              className="relative bg-white rounded-2xl border border-gray-100 shadow-sm p-6"
            >
              <div className="w-11 h-11 rounded-xl bg-blue-50 flex items-center justify-center mb-4">
                <step.icon className="w-6 h-6 text-blue-600" />
              </div>
              <span className="absolute top-6 right-6 text-3xl font-bold text-gray-400">
                {i + 1}
              </span>
              <h3 className="font-semibold text-lg text-gray-900">
                {step.title}
              </h3>
              <p className="mt-2 text-sm text-gray-600">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CATEGORY SHOWCASE */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900">
            Browse by Category
          </h2>
          <p className="mt-3 text-gray-600">
            Find the right professional for exactly what you need.
          </p>
        </div>

        {categoriesLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div
                key={i}
                className="h-28 rounded-2xl bg-white animate-pulse border"
              />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {categories.map((category) => (
              <Link
                key={category.id}
                href={`/providers/${category.slug}`}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg hover:border-blue-200 transition-all p-6 text-center group"
              >
                <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center mx-auto mb-3 group-hover:bg-blue-100 transition-colors">
                  <CategoryIcon
                    slug={category.slug}
                    className="w-6 h-6 text-blue-600"
                  />
                </div>
                <p className="font-medium text-gray-900 text-sm">
                  {category.name}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  {category.children.length} services
                </p>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* FEATURED PROVIDERS */}
      {(featuredLoading || featured.length > 0) && (
        <section className="max-w-6xl mx-auto px-6 py-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900">
              Top-Rated Providers
            </h2>
            <p className="mt-3 text-gray-600">
              Trusted by clients across Nairobi.
            </p>
          </div>

          {featuredLoading ? (
            <div className="grid md:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-44 rounded-2xl bg-white animate-pulse border"
                />
              ))}
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featured.map((provider) => (
                <Link
                  key={provider.id}
                  href={`/provider/${provider.id}`}
                  className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl transition-all p-6"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-700 font-semibold flex items-center justify-center shrink-0 overflow-hidden">
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
                    <div className="min-w-0">
                      <p className="font-semibold text-gray-900 truncate">
                        {provider.name}
                      </p>
                      <p className="text-sm text-blue-600 truncate">
                        {provider.category.name}
                      </p>
                    </div>
                  </div>

                  {provider.bio && (
                    <p className="mt-3 text-sm text-gray-600 line-clamp-2">
                      {provider.bio}
                    </p>
                  )}

                  <div className="flex items-center gap-1 mt-4 text-sm text-gray-500">
                    <StarIcon className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                    {provider.rating?.toFixed(1) ?? "0.0"}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>
      )}

      {/* TRUST & SAFETY */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        <div className="grid md:grid-cols-3 gap-6">
          <FeatureCard
            icon={MapPinIcon}
            title="Location-Based Matching"
            desc="Find professionals near your exact location using real-time geolocation."
          />
          <FeatureCard
            icon={BoltIcon}
            title="Instant Access"
            desc="No delays. See available providers immediately when you open the app."
          />
          <FeatureCard
            icon={ShieldCheckIcon}
            title="Reviewed & Reportable"
            desc="Every provider can be rated and reviewed. Reports are reviewed by our team, and accounts can be suspended for violations."
          />
        </div>
      </section>

      {/* FAQ */}
      <section className="max-w-3xl mx-auto px-6 py-16">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-gray-900">
            Frequently Asked Questions
          </h2>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm divide-y divide-gray-100 overflow-hidden">
          {FAQS.map((faq, i) => {
            const isOpen = openFaq === i;
            return (
              <div key={faq.q}>
                <button
                  onClick={() => setOpenFaq(isOpen ? null : i)}
                  className="w-full flex items-center justify-between px-6 py-4 text-left"
                >
                  <span className="font-medium text-gray-900 text-sm">
                    {faq.q}
                  </span>
                  <ChevronDownIcon
                    className={`w-4 h-4 text-gray-400 shrink-0 transition-transform ${
                      isOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-6 pb-4 text-sm text-gray-600">{faq.a}</div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-blue-600 text-white py-16 mt-10">
        <div className="max-w-4xl mx-auto text-center px-6">
          <h2 className="text-3xl font-bold">Ready to find help near you?</h2>
          <p className="mt-3 text-blue-100">
            Join clients across Nairobi connecting with trusted service
            providers.
          </p>
          <Link
            href="/providers"
            className="mt-6 inline-block px-6 py-3 bg-white text-blue-600 font-semibold rounded-xl hover:bg-gray-100 transition"
          >
            Get Started
          </Link>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-gray-100">
        <div className="max-w-6xl mx-auto px-6 py-10">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-6">
            <p className="text-lg font-bold text-gray-900">
              <span className="text-blue-600">Uber</span>Fundi
            </p>
            <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-gray-500">
              <Link
                href="/providers"
                className="hover:text-blue-600 transition"
              >
                Browse Services
              </Link>
              <Link
                href="/add-provider"
                className="hover:text-blue-600 transition"
              >
                Offer Services
              </Link>
              <Link href="/search" className="hover:text-blue-600 transition">
                Search
              </Link>
              <Link href="/sign-in" className="hover:text-blue-600 transition">
                Sign In
              </Link>
            </div>
          </div>
          <p className="text-center text-xs text-gray-400 mt-8">
            © {new Date().getFullYear()} UberFundi. Built for local connections.
          </p>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({
  icon: Icon,
  title,
  desc,
}: {
  icon: React.ElementType;
  title: string;
  desc: string;
}) {
  return (
    <div className="p-6 bg-white rounded-2xl shadow-sm border hover:shadow-md transition">
      <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center mb-3">
        <Icon className="w-5 h-5 text-blue-600" />
      </div>
      <h3 className="font-semibold text-lg text-gray-900">{title}</h3>
      <p className="mt-2 text-gray-600 text-sm">{desc}</p>
    </div>
  );
}
