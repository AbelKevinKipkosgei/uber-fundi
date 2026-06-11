import Link from "next/link";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 via-white to-blue-50">
      {/* HERO SECTION */}
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
          area. Fast, reliable, and location-based matching in seconds.
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
            Become a Provider
          </Link>
        </div>

        <p className="mt-4 text-sm text-gray-500">
          No signup required to browse • Free to get started
        </p>
      </section>

      {/* FEATURES SECTION */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        <div className="grid md:grid-cols-3 gap-6">
          <FeatureCard
            title="📍 Location-Based Matching"
            desc="Find professionals near your exact location using real-time geolocation."
          />

          <FeatureCard
            title="⚡ Instant Access"
            desc="No delays. See available providers immediately when you open the app."
          />

          <FeatureCard
            title="🔐 Trusted Network"
            desc="All providers are authenticated using secure Clerk authentication."
          />
        </div>
      </section>

      {/* CTA SECTION */}
      <section className="bg-blue-600 text-white py-16 mt-10">
        <div className="max-w-4xl mx-auto text-center px-6">
          <h2 className="text-3xl font-bold">Ready to find help near you?</h2>

          <p className="mt-3 text-blue-100">
            Join thousands of users connecting with trusted service providers.
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
      <footer className="text-center py-10 text-sm text-gray-500">
        © {new Date().getFullYear()} Service Finder. Built for local
        connections.
      </footer>
    </div>
  );
}

/* Feature Card Component */
function FeatureCard({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="p-6 bg-white rounded-2xl shadow-sm border hover:shadow-md transition">
      <h3 className="font-semibold text-lg text-gray-900">{title}</h3>
      <p className="mt-2 text-gray-600 text-sm">{desc}</p>
    </div>
  );
}
