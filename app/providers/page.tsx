// import Link from "next/link";

// const categories = [
//   {
//     name: "Electricians",
//     icon: "⚡",
//     desc: "Wiring, repairs & installations",
//     color: "from-yellow-100 to-yellow-50",
//   },
//   {
//     name: "Plumbers",
//     icon: "🔧",
//     desc: "Leaks, pipes & installations",
//     color: "from-blue-100 to-blue-50",
//   },
//   {
//     name: "Cleaners",
//     icon: "🧼",
//     desc: "Home & office cleaning services",
//     color: "from-green-100 to-green-50",
//   },
//   {
//     name: "Carpenters",
//     icon: "🪵",
//     desc: "Furniture & woodwork experts",
//     color: "from-orange-100 to-orange-50",
//   },
//   {
//     name: "Mechanics",
//     icon: "🚗",
//     desc: "Car repairs & diagnostics",
//     color: "from-red-100 to-red-50",
//   },
//   {
//     name: "Painters",
//     icon: "🎨",
//     desc: "Interior & exterior painting",
//     color: "from-purple-100 to-purple-50",
//   },
// ];

// export default function ProvidersPage() {
//   return (
//     <div className="min-h-screen bg-linear-to-br from-gray-50 via-white to-blue-50">
//       {/* HEADER */}
//       <div className="max-w-6xl mx-auto px-6 pt-16 pb-10">
//         <h1 className="text-4xl font-bold text-gray-900">
//           Browse Service Categories
//         </h1>

//         <p className="mt-3 text-gray-600">
//           Find skilled professionals by category. Tap a service to explore
//           available providers near you.
//         </p>
//       </div>

//       {/* CATEGORY GRID */}
//       <div className="max-w-6xl mx-auto px-6 pb-20 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
//         {categories.map((cat) => (
//           <Link
//             key={cat.name}
//             href={`/providers/${cat.name.toLowerCase()}`}
//             className={`group relative p-6 rounded-2xl border shadow-sm hover:shadow-xl transition-all duration-300 bg-linear-to-br ${cat.color} hover:scale-[1.02]`}
//           >
//             {/* ICON */}
//             <div className="text-4xl">{cat.icon}</div>

//             {/* TITLE */}
//             <h2 className="mt-4 text-xl font-semibold text-gray-900 group-hover:text-gray-800">
//               {cat.name}
//             </h2>

//             {/* DESCRIPTION */}
//             <p className="mt-2 text-sm text-gray-600">{cat.desc}</p>

//             {/* CTA */}
//             <div className="mt-6 text-sm font-medium text-gray-700 group-hover:text-gray-900">
//               View providers →
//             </div>

//             {/* GLOW EFFECT */}
//             <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-50 transition bg-white/20 backdrop-blur-sm" />
//           </Link>
//         ))}
//       </div>

//       {/* BOTTOM CTA */}
//       <div className="text-center pb-16">
//         <p className="text-gray-500 text-sm">
//           Can't find what you need? More categories coming soon.
//         </p>
//       </div>
//     </div>
//   );
// }
"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const categories = [
  {
    name: "Electricians",
    icon: "⚡",
    desc: "Wiring, repairs & installations",
    color: "from-yellow-100 to-yellow-50",
  },
  {
    name: "Plumbers",
    icon: "🔧",
    desc: "Leaks, pipes & installations",
    color: "from-blue-100 to-blue-50",
  },
  {
    name: "Cleaners",
    icon: "🧼",
    desc: "Home & office cleaning services",
    color: "from-green-100 to-green-50",
  },
  {
    name: "Carpenters",
    icon: "🪵",
    desc: "Furniture & woodwork experts",
    color: "from-orange-100 to-orange-50",
  },
  {
    name: "Mechanics",
    icon: "🚗",
    desc: "Car repairs & diagnostics",
    color: "from-red-100 to-red-50",
  },
  {
    name: "Painters",
    icon: "🎨",
    desc: "Interior & exterior painting",
    color: "from-purple-100 to-purple-50",
  },
];

type Provider = {
  id: number;
  name: string;
  service: string;
  phone: string;
  distance: number;
  rating: number;
};

export default function ProvidersPage() {
  const [providers, setProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const res = await fetch(
            `/api/providers/nearby?lat=${pos.coords.latitude}&lng=${pos.coords.longitude}`,
          );

          const data = await res.json();

          setProviders(data);
        } catch (error) {
          console.error(error);
        } finally {
          setLoading(false);
        }
      },
      () => {
        setLoading(false);
      },
    );
  }, []);

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 via-white to-blue-50">
      {/* HEADER */}
      <div className="max-w-6xl mx-auto px-6 pt-16 pb-10">
        <h1 className="text-4xl font-bold text-gray-900">
          Browse Service Categories
        </h1>

        <p className="mt-3 text-gray-600">
          Find skilled professionals by category and discover providers closest
          to your location.
        </p>
      </div>

      {/* CATEGORY GRID */}
      <div className="max-w-6xl mx-auto px-6 pb-16 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((cat) => (
          <Link
            key={cat.name}
            href={`/providers/${cat.name.toLowerCase()}`}
            className={`group relative overflow-hidden p-6 rounded-2xl border border-white/60 shadow-sm hover:shadow-xl transition-all duration-300 bg-linear-to-br ${cat.color} hover:scale-[1.02]`}
          >
            <div className="text-4xl">{cat.icon}</div>

            <h2 className="mt-4 text-xl font-semibold text-gray-900">
              {cat.name}
            </h2>

            <p className="mt-2 text-sm text-gray-600">{cat.desc}</p>

            <div className="mt-6 text-sm font-medium text-gray-700">
              View providers →
            </div>

            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition bg-white/10" />
          </Link>
        ))}
      </div>

      {/* NEARBY PROVIDERS */}
      <div className="max-w-6xl mx-auto px-6 pb-20">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold text-gray-900">Nearby Providers</h2>

          <div className="text-sm text-gray-500">Sorted by distance</div>
        </div>

        {loading ? (
          <div className="grid md:grid-cols-3 gap-6">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="h-48 rounded-2xl bg-white animate-pulse border"
              />
            ))}
          </div>
        ) : providers.length === 0 ? (
          <div className="bg-white rounded-2xl border p-12 text-center shadow-sm">
            <div className="text-5xl mb-4">📍</div>

            <h3 className="text-xl font-semibold text-gray-900">
              No providers found nearby
            </h3>

            <p className="mt-2 text-gray-500">
              Be the first provider in your area.
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
                      {provider.service}
                    </p>
                  </div>

                  <span className="px-3 py-1 text-xs rounded-full bg-green-100 text-green-700">
                    Available
                  </span>
                </div>

                <div className="mt-5 space-y-2 text-sm text-gray-600">
                  <p>📞 {provider.phone}</p>

                  <p>📍 {Number(provider.distance).toFixed(1)} km away</p>

                  <p>⭐ {provider.rating ?? 0}</p>
                </div>

                <button className="mt-6 w-full rounded-xl bg-blue-600 text-white py-3 font-medium hover:bg-blue-700 transition">
                  Contact Provider
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* FOOTER */}
      <div className="text-center pb-16">
        <p className="text-gray-500 text-sm">
          Can't find what you need? More categories coming soon.
        </p>
      </div>
    </div>
  );
}
