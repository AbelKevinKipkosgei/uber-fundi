"use client";

import { useState } from "react";
import { useUser } from "@clerk/nextjs";

export default function AddProviderPage() {
  const { user } = useUser();
  const [success, setSuccess] = useState(false);

  const [form, setForm] = useState({
    name: "",
    service: "Plumber",
    phone: "",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    navigator.geolocation.getCurrentPosition(async (position) => {
      const latitude = position.coords.latitude;
      const longitude = position.coords.longitude;

      const res = await fetch("/api/providers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clerk_user_id: user?.id,
          name: form.name,
          service: form.service,
          phone: form.phone,
          latitude,
          longitude,
        }),
      });

      setLoading(false);

      if (res.ok) {
        setForm({
          name: "",
          service: "Plumber",
          phone: "",
        });

        setSuccess(true);
        setTimeout(() => {
          setSuccess(false);
        }, 5000);
      } else {
        alert("Something went wrong");
      }
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-blue-50 via-white to-indigo-100 px-4">
      {/* CARD */}
      <div className="w-full max-w-lg bg-white/80 backdrop-blur-xl border border-gray-200 shadow-xl rounded-2xl p-8">
        {/* HEADER */}
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">
            Become a Provider
          </h1>
          <p className="text-gray-500 mt-2">
            Join UberFundi and start getting clients near you
          </p>
        </div>
        {/* SUCCESS MESSAGE */}
        {success && (
          <div className="mb-4 rounded-xl bg-green-50 border border-green-200 p-4 text-green-700">
            Provider registered successfully 🎉
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* NAME */}
          <div>
            <label className="text-sm text-gray-600">Full Name</label>
            <input
              name="name"
              value={form.name}
              placeholder="John Doe"
              onChange={handleChange}
              required
              className="w-full mt-1 px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition placeholder:text-gray-400 text-gray-500"
            />
          </div>

          {/* SERVICE */}
          <div>
            <label className="text-sm text-gray-600">Service Type</label>
            <select
              name="service"
              value={form.service}
              required
              onChange={handleChange}
              className="w-full mt-1 px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition placeholder:text-gray-400 text-gray-500"
            >
              <option>Plumber</option>
              <option>Electrician</option>
              <option>Carpenter</option>
              <option>Mechanic</option>
              <option>Cleaner</option>
              <option>Painter</option>
            </select>
          </div>

          {/* PHONE */}
          <div>
            <label className="text-sm text-gray-600">Phone Number</label>
            <input
              name="phone"
              value={form.phone}
              placeholder="+254 7XX XXX XXX"
              onChange={handleChange}
              required
              className="w-full mt-1 px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition placeholder:text-gray-400 text-gray-500"
            />
          </div>

          {/* SUBMIT */}
          <button
            type="submit"
            disabled={loading}
            className="w-full mt-4 bg-blue-600 text-white py-3 rounded-xl font-medium shadow-md hover:bg-blue-700 transition disabled:opacity-60"
          >
            {loading ? "Registering..." : "Become a Provider"}
          </button>
        </form>

        {/* FOOTER NOTE */}
        <p className="text-xs text-center text-gray-400 mt-5">
          Your location is used to match you with nearby clients.
        </p>
      </div>
    </div>
  );
}
