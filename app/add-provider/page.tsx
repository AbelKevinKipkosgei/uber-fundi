"use client";

import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { AlertCircle, CheckCircle2 } from "lucide-react";

type Category = {
  id: string;
  name: string;
  slug: string;
  children: { id: string; name: string; slug: string }[];
};

export default function AddProviderPage() {
  const { user } = useUser();
  const [success, setSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const [categories, setCategories] = useState<Category[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);

  const [form, setForm] = useState({
    name: "",
    phone: "",
    bio: "",
    categoryId: "",
  });

  const [selectedSubcategoryIds, setSelectedSubcategoryIds] = useState<
    string[]
  >([]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch("/api/categories");
        const data = await res.json();
        setCategories(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Failed to load categories", err);
        setErrorMessage(
          "Couldn't load categories. Please refresh and try again.",
        );
      } finally {
        setCategoriesLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const selectedCategory = categories.find((c) => c.id === form.categoryId);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    const { name, value } = e.target;

    if (name === "categoryId") {
      setSelectedSubcategoryIds([]);
    }

    setForm({ ...form, [name]: value });
  };

  const toggleSubcategory = (id: string) => {
    setSelectedSubcategoryIds((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id],
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage(null);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude;

        try {
          const res = await fetch("/api/providers", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              clerkUserId: user?.id,
              name: form.name,
              phone: form.phone,
              bio: form.bio,
              categoryId: form.categoryId,
              subcategoryIds: selectedSubcategoryIds,
              latitude,
              longitude,
            }),
          });

          if (res.ok) {
            setForm({ name: "", phone: "", bio: "", categoryId: "" });
            setSelectedSubcategoryIds([]);
            setSuccess(true);
            setTimeout(() => setSuccess(false), 5000);
          } else {
            const data = await res.json().catch(() => null);
            setErrorMessage(
              data?.error ?? "Something went wrong. Please try again.",
            );
          }
        } catch (err) {
          console.error(err);
          setErrorMessage("Something went wrong. Please try again.");
        } finally {
          setLoading(false);
        }
      },
      () => {
        setLoading(false);
        setErrorMessage(
          "We need your location to match you with nearby clients. Please enable location access and try again.",
        );
      },
    );
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-blue-50 via-white to-indigo-100 px-4 py-12">
      <div className="w-full max-w-lg bg-white/80 backdrop-blur-xl border border-gray-200 shadow-xl rounded-2xl p-8">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">
            Become a Provider
          </h1>
          <p className="text-gray-500 mt-2">
            Join UberFundi and start getting clients near you
          </p>
        </div>

        {success && (
          <div className="mb-4 flex items-start gap-2.5 rounded-xl bg-green-50 border border-green-200 p-4 text-green-700">
            <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />
            <span>Provider registered successfully 🎉</span>
          </div>
        )}

        {errorMessage && (
          <div className="mb-4 flex items-start gap-2.5 rounded-xl bg-red-50 border border-red-200 p-4 text-red-700">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
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

          <div>
            <label className="text-sm text-gray-600">Main Category</label>
            <select
              name="categoryId"
              value={form.categoryId}
              required
              onChange={handleChange}
              disabled={categoriesLoading}
              className="w-full mt-1 px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition text-gray-500 disabled:opacity-60"
            >
              <option value="" disabled>
                {categoriesLoading
                  ? "Loading categories..."
                  : "Select a category"}
              </option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          {selectedCategory && selectedCategory.children.length > 0 && (
            <div>
              <label className="text-sm text-gray-600">
                Services you offer under {selectedCategory.name}
              </label>
              <div className="mt-2 grid grid-cols-2 gap-2">
                {selectedCategory.children.map((sub) => (
                  <label
                    key={sub.id}
                    className="flex items-center gap-2 text-sm text-gray-600 border border-gray-200 rounded-xl px-3 py-2 cursor-pointer hover:border-blue-300"
                  >
                    <input
                      type="checkbox"
                      checked={selectedSubcategoryIds.includes(sub.id)}
                      onChange={() => toggleSubcategory(sub.id)}
                      className="accent-blue-600"
                    />
                    {sub.name}
                  </label>
                ))}
              </div>
            </div>
          )}

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

          <div>
            <label className="text-sm text-gray-600">
              Short Bio <span className="text-gray-400">(optional)</span>
            </label>
            <textarea
              name="bio"
              value={form.bio}
              placeholder="Tell clients a bit about your experience..."
              onChange={handleChange}
              rows={3}
              className="w-full mt-1 px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition placeholder:text-gray-400 text-gray-500 resize-none"
            />
          </div>

          <button
            type="submit"
            disabled={loading || categoriesLoading}
            className="w-full mt-4 bg-blue-600 text-white py-3 rounded-xl font-medium shadow-md hover:bg-blue-700 transition disabled:opacity-60"
          >
            {loading ? "Registering..." : "Become a Provider"}
          </button>
        </form>

        <p className="text-xs text-center text-gray-400 mt-5">
          Your location is used to match you with nearby clients.
        </p>
      </div>
    </div>
  );
}
