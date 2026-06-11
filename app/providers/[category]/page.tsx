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
//     <div className="min-h-screen bg-linear-to-br from-white via-blue-50 to-indigo-50">
//       <div className="max-w-6xl mx-auto px-6 py-12">
//         <h1 className="text-4xl font-bold text-gray-900 capitalize">
//           {providers[0]?.service || "Providers"}
//         </h1>

//         <p className="text-gray-600 mt-2">Browse professionals near you.</p>

//         {loading ? (
//           <div className="mt-10 grid md:grid-cols-3 gap-6">
//             {[1, 2, 3].map((i) => (
//               <div
//                 key={i}
//                 className="h-48 rounded-2xl bg-white animate-pulse border"
//               />
//             ))}
//           </div>
//         ) : providers.length === 0 ? (
//           <div className="mt-10 bg-white rounded-2xl border p-10 text-center">
//             <h2 className="text-xl font-semibold">No providers found</h2>

//             <p className="text-gray-500 mt-2">
//               No providers have registered in this category yet.
//             </p>
//           </div>
//         ) : (
//           <div className="mt-10 grid md:grid-cols-2 lg:grid-cols-3 gap-6">
//             {providers.map((provider) => (
//               <div
//                 key={provider.id}
//                 className="bg-white rounded-2xl border shadow-sm hover:shadow-xl transition p-6"
//               >
//                 <h3 className="text-xl font-semibold">{provider.name}</h3>

//                 <p className="text-blue-600 mt-1">{provider.service}</p>

//                 <p className="mt-3 text-gray-600">📞 {provider.phone}</p>

//                 <div className="mt-4 flex items-center gap-2">
//                   <span className="px-3 py-1 rounded-full bg-yellow-100 text-yellow-700 text-sm">
//                     ⭐ {provider.rating ?? 0}
//                   </span>
//                 </div>

//                 <button className="mt-5 w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl">
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

import { useEffect, useState } from "react";

type Provider = {
  id: number;
  name: string;
  service: string;
  phone: string;
  rating: number;
};

export default function CategoryPage({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const [providers, setProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProviders() {
      const { category } = await params;

      const res = await fetch(`/api/providers/category/${category}`);
      const data = await res.json();

      setProviders(data);
      setLoading(false);
    }

    loadProviders();
  }, [params]);

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="max-w-7xl mx-auto px-6 py-14">
        {/* HEADER */}
        <div className="text-center mb-12">
          <span className="inline-flex items-center rounded-full bg-blue-100 px-4 py-2 text-sm font-medium text-blue-700">
            Available Professionals
          </span>

          <h1 className="mt-5 text-5xl font-extrabold text-gray-900 capitalize tracking-tight">
            {providers[0]?.service || "Providers"}
          </h1>

          <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
            Browse verified professionals near your location and connect
            instantly.
          </p>
        </div>

        {/* LOADING */}
        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="h-64 rounded-3xl bg-white animate-pulse shadow-sm border"
              />
            ))}
          </div>
        ) : providers.length === 0 ? (
          /* EMPTY STATE */
          <div className="bg-white/80 backdrop-blur-sm border border-gray-100 rounded-3xl p-12 text-center shadow-lg">
            <div className="text-6xl mb-4">🔍</div>

            <h2 className="text-2xl font-bold text-gray-900">
              No Providers Found
            </h2>

            <p className="text-gray-500 mt-3">
              No professionals have registered in this category yet.
            </p>
          </div>
        ) : (
          /* PROVIDERS GRID */
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {providers.map((provider) => (
              <div
                key={provider.id}
                className="group relative overflow-hidden rounded-3xl border border-white/50 bg-white/80 backdrop-blur-md shadow-md hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 p-6"
              >
                {/* TOP ACCENT BAR */}
                <div className="absolute top-0 left-0 right-0 h-2 bg-linear-to-r from-blue-500 via-indigo-500 to-purple-500" />

                {/* NAME (HIGHLIGHTED) */}
                <h3 className="text-2xl font-extrabold text-gray-900 tracking-tight">
                  {provider.name}
                </h3>

                {/* SERVICE BADGE */}
                <span className="inline-flex mt-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-sm font-medium">
                  {provider.service}
                </span>

                {/* CONTACT INFO */}
                <div className="mt-5 space-y-2 text-gray-700">
                  <p className="flex items-center gap-2">
                    📞 <span>{provider.phone}</span>
                  </p>
                </div>

                {/* STATS */}
                <div className="mt-4 flex items-center gap-2">
                  <span className="px-3 py-1 rounded-full bg-yellow-100 text-yellow-700 text-sm font-semibold">
                    ⭐ {provider.rating ?? 0}
                  </span>

                  <span className="px-3 py-1 rounded-full bg-green-100 text-green-700 text-sm font-semibold">
                    Available
                  </span>
                </div>

                {/* CTA */}
                <button className="mt-6 w-full rounded-2xl bg-linear-to-r from-blue-600 to-indigo-600 py-3 text-white font-semibold shadow-md hover:from-blue-700 hover:to-indigo-700 transition">
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
