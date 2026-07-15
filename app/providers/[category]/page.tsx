// "use client";

// import { useEffect, useState } from "react";

// type Provider = {
//   id: number;
//   name: string;
//   service: string;
//   phone: string;
//   rating: number;
// };

// export default function CategoryPage({
//   params,
// }: {
//   params: Promise<{ category: string }>;
// }) {
//   const [providers, setProviders] = useState<Provider[]>([]);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     async function loadProviders() {
//       const { category } = await params;

//       const res = await fetch(`/api/providers/category/${category}`);
//       const data = await res.json();

//       setProviders(data);
//       setLoading(false);
//     }

//     loadProviders();
//   }, [params]);

//   return (
//     <div className="min-h-screen bg-linear-to-br from-slate-50 via-blue-50 to-indigo-100">
//       <div className="max-w-7xl mx-auto px-6 py-14">
//         {/* HEADER */}
//         <div className="text-center mb-12">
//           <span className="inline-flex items-center rounded-full bg-blue-100 px-4 py-2 text-sm font-medium text-blue-700">
//             Available Professionals
//           </span>

//           <h1 className="mt-5 text-5xl font-extrabold text-gray-900 capitalize tracking-tight">
//             {providers[0]?.service || "Providers"}
//           </h1>

//           <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
//             Browse verified professionals near your location and connect
//             instantly.
//           </p>
//         </div>

//         {/* LOADING */}
//         {loading ? (
//           <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
//             {[1, 2, 3, 4, 5, 6].map((i) => (
//               <div
//                 key={i}
//                 className="h-64 rounded-3xl bg-white animate-pulse shadow-sm border"
//               />
//             ))}
//           </div>
//         ) : providers.length === 0 ? (
//           /* EMPTY STATE */
//           <div className="bg-white/80 backdrop-blur-sm border border-gray-100 rounded-3xl p-12 text-center shadow-lg">
//             <div className="text-6xl mb-4">🔍</div>

//             <h2 className="text-2xl font-bold text-gray-900">
//               No Providers Found
//             </h2>

//             <p className="text-gray-500 mt-3">
//               No professionals have registered in this category yet.
//             </p>
//           </div>
//         ) : (
//           /* PROVIDERS GRID */
//           <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
//             {providers.map((provider) => (
//               <div
//                 key={provider.id}
//                 className="group relative overflow-hidden rounded-3xl border border-white/50 bg-white/80 backdrop-blur-md shadow-md hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 p-6"
//               >
//                 {/* TOP ACCENT BAR */}
//                 <div className="absolute top-0 left-0 right-0 h-2 bg-linear-to-r from-blue-500 via-indigo-500 to-purple-500" />

//                 {/* NAME (HIGHLIGHTED) */}
//                 <h3 className="text-2xl font-extrabold text-gray-900 tracking-tight">
//                   {provider.name}
//                 </h3>

//                 {/* SERVICE BADGE */}
//                 <span className="inline-flex mt-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-sm font-medium">
//                   {provider.service}
//                 </span>

//                 {/* CONTACT INFO */}
//                 <div className="mt-5 space-y-2 text-gray-700">
//                   <p className="flex items-center gap-2">
//                     📞 <span>{provider.phone}</span>
//                   </p>
//                 </div>

//                 {/* STATS */}
//                 <div className="mt-4 flex items-center gap-2">
//                   <span className="px-3 py-1 rounded-full bg-yellow-100 text-yellow-700 text-sm font-semibold">
//                     ⭐ {provider.rating ?? 0}
//                   </span>

//                   <span className="px-3 py-1 rounded-full bg-green-100 text-green-700 text-sm font-semibold">
//                     Available
//                   </span>
//                 </div>

//                 {/* CTA */}
//                 <button className="mt-6 w-full rounded-2xl bg-linear-to-r from-blue-600 to-indigo-600 py-3 text-white font-semibold shadow-md hover:from-blue-700 hover:to-indigo-700 transition">
//                   Contact Provider
//                 </button>
//               </div>
//             ))}
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }

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
        setProviders(data);
      } catch (err) {
        console.error(err);
        setError("Failed to load providers");
      } finally {
        setLoading(false);
      }
    };

    fetchProviders();
  }, [categorySlug, activeSub]);

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
              <div
                key={provider.id}
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

                <button className="mt-6 w-full rounded-xl bg-blue-600 text-white py-3 font-medium hover:bg-blue-700 transition">
                  Contact Provider
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
