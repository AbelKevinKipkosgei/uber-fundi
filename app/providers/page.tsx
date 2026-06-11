import Link from "next/link";

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

export default function ProvidersPage() {
  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 via-white to-blue-50">
      {/* HEADER */}
      <div className="max-w-6xl mx-auto px-6 pt-16 pb-10">
        <h1 className="text-4xl font-bold text-gray-900">
          Browse Service Categories
        </h1>

        <p className="mt-3 text-gray-600">
          Find skilled professionals by category. Tap a service to explore
          available providers near you.
        </p>
      </div>

      {/* CATEGORY GRID */}
      <div className="max-w-6xl mx-auto px-6 pb-20 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((cat) => (
          <Link
            key={cat.name}
            href={`/providers/${cat.name.toLowerCase()}`}
            className={`group relative p-6 rounded-2xl border shadow-sm hover:shadow-xl transition-all duration-300 bg-linear-to-br ${cat.color} hover:scale-[1.02]`}
          >
            {/* ICON */}
            <div className="text-4xl">{cat.icon}</div>

            {/* TITLE */}
            <h2 className="mt-4 text-xl font-semibold text-gray-900 group-hover:text-gray-800">
              {cat.name}
            </h2>

            {/* DESCRIPTION */}
            <p className="mt-2 text-sm text-gray-600">{cat.desc}</p>

            {/* CTA */}
            <div className="mt-6 text-sm font-medium text-gray-700 group-hover:text-gray-900">
              View providers →
            </div>

            {/* GLOW EFFECT */}
            <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-50 transition bg-white/20 backdrop-blur-sm" />
          </Link>
        ))}
      </div>

      {/* BOTTOM CTA */}
      <div className="text-center pb-16">
        <p className="text-gray-500 text-sm">
          Can't find what you need? More categories coming soon.
        </p>
      </div>
    </div>
  );
}
