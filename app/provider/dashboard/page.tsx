"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import CreatePostForm from "@/components/provider/CreatePostForm";
import PostsList from "@/components/provider/PostsList";
import {
  AlertCircle,
  CheckCircle2,
  UserPlus,
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
  isAvailable: boolean | null;
  category: { id: string; name: string; slug: string };
  subcategories: { category: Subcategory }[];
};

type Category = {
  id: string;
  name: string;
  slug: string;
  children: Subcategory[];
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

export default function ProviderDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [provider, setProvider] = useState<Provider | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [availableSubcategories, setAvailableSubcategories] = useState<
    Subcategory[]
  >([]);

  const [form, setForm] = useState({ name: "", phone: "", bio: "" });
  const [isAvailable, setIsAvailable] = useState(true);
  const [selectedSubcategoryIds, setSelectedSubcategoryIds] = useState<
    string[]
  >([]);

  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [postsRefreshKey, setPostsRefreshKey] = useState(0);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch("/api/providers/me");

        if (res.status === 404) {
          setNotFound(true);
          return;
        }

        if (!res.ok) {
          const data = await res.json().catch(() => null);
          setLoadError(data?.error ?? "Failed to load your profile");
          return;
        }

        const data: Provider = await res.json();
        setProvider(data);
        setForm({ name: data.name, phone: data.phone, bio: data.bio ?? "" });
        setIsAvailable(data.isAvailable ?? true);
        setSelectedSubcategoryIds(data.subcategories.map((s) => s.category.id));

        const catRes = await fetch("/api/categories");
        const categories: Category[] = await catRes.json();
        const match = categories.find((c) => c.id === data.category.id);
        setAvailableSubcategories(match?.children ?? []);
      } catch (err) {
        console.error(err);
        setLoadError("Failed to load your profile");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const toggleSubcategory = (id: string) => {
    setSelectedSubcategoryIds((prev: string[]) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id],
    );
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaveError(null);
    setSaveSuccess(false);

    try {
      const res = await fetch("/api/providers/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          phone: form.phone,
          bio: form.bio,
          isAvailable,
          subcategoryIds: selectedSubcategoryIds,
        }),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        setSaveError(data?.error ?? "Failed to save changes");
        return;
      }

      setProvider(data.provider);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 4000);
    } catch (err) {
      console.error(err);
      setSaveError("Failed to save changes");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-gray-50 via-white to-blue-50 px-6 py-14">
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="h-8 w-56 bg-white rounded-lg animate-pulse border" />
          <div className="h-96 rounded-3xl bg-white animate-pulse border" />
        </div>
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="min-h-screen bg-linear-to-br from-gray-50 via-white to-blue-50 flex items-center justify-center px-6">
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-10 text-center max-w-md">
          <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center mx-auto mb-5">
            <UserPlus className="w-7 h-7 text-blue-600" />
          </div>
          <h1 className="text-xl font-bold text-gray-900">
            You&apos;re not a provider yet
          </h1>
          <p className="mt-2 text-gray-500">
            Create a provider profile to start getting matched with clients near
            you.
          </p>
          <Link
            href="/add-provider"
            className="inline-flex items-center justify-center mt-6 w-full rounded-xl bg-blue-600 text-white py-3 font-medium hover:bg-blue-700 transition"
          >
            Become a Provider
          </Link>
        </div>
      </div>
    );
  }

  if (loadError || !provider) {
    return (
      <div className="min-h-screen bg-linear-to-br from-gray-50 via-white to-blue-50 flex items-center justify-center px-6">
        <div className="bg-white rounded-2xl border p-10 text-center shadow-sm max-w-md">
          <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-3" />
          <p className="text-gray-700">{loadError}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 via-white to-blue-50">
      <div className="max-w-2xl mx-auto px-6 pt-12 pb-20">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-11 h-11 rounded-xl bg-blue-50 flex items-center justify-center">
            <CategoryIcon
              slug={provider.category.slug}
              className="w-6 h-6 text-blue-600"
            />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Your Provider Profile
            </h1>
            <p className="text-sm text-gray-500">{provider.category.name}</p>
          </div>
        </div>

        {saveSuccess && (
          <div className="mb-4 flex items-start gap-2.5 rounded-xl bg-green-50 border border-green-200 p-4 text-green-700">
            <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />
            <span>Profile updated successfully</span>
          </div>
        )}

        {saveError && (
          <div className="mb-4 flex items-start gap-2.5 rounded-xl bg-red-50 border border-red-200 p-4 text-red-700">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <span>{saveError}</span>
          </div>
        )}

        <form
          onSubmit={handleSave}
          className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8 space-y-5"
        >
          <div className="flex items-center justify-between rounded-xl border border-gray-200 px-4 py-3">
            <div>
              <p className="font-medium text-gray-900">Available for work</p>
              <p className="text-sm text-gray-500">
                Turn this off if you&apos;re temporarily not taking clients
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsAvailable((v) => !v)}
              className={`relative w-12 h-7 rounded-full transition-colors shrink-0 ${
                isAvailable ? "bg-green-500" : "bg-gray-300"
              }`}
            >
              <span
                className={`absolute top-1 left-1 w-5 h-5 rounded-full bg-white transition-transform ${
                  isAvailable ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </div>

          <div>
            <label className="text-sm text-gray-600">Full Name</label>
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
              className="w-full mt-1 px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition text-gray-700"
            />
          </div>

          <div>
            <label className="text-sm text-gray-600">Phone Number</label>
            <input
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              required
              className="w-full mt-1 px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition text-gray-700"
            />
          </div>

          <div>
            <label className="text-sm text-gray-600">
              Short Bio <span className="text-gray-400">(optional)</span>
            </label>
            <textarea
              value={form.bio}
              onChange={(e) => setForm({ ...form, bio: e.target.value })}
              rows={3}
              className="w-full mt-1 px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition text-gray-700 resize-none"
            />
          </div>

          {availableSubcategories.length > 0 && (
            <div>
              <label className="text-sm text-gray-600">
                Services you offer under {provider.category.name}
              </label>
              <div className="mt-2 grid grid-cols-2 gap-2">
                {availableSubcategories.map((sub: Subcategory) => (
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

          <p className="text-xs text-gray-400">
            Your main category ({provider.category.name}) can&apos;t be changed
            here. Contact support if you need to switch categories.
          </p>

          <button
            type="submit"
            disabled={saving}
            className="w-full rounded-xl bg-blue-600 text-white py-3 font-medium shadow-md hover:bg-blue-700 transition disabled:opacity-60"
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </form>

        <div className="mt-8 space-y-6">
          <CreatePostForm
            categoryOptions={[
              { id: provider.category.id, name: provider.category.name },
              ...provider.subcategories.map((s) => ({
                id: s.category.id,
                name: s.category.name,
              })),
            ]}
            onCreated={() => setPostsRefreshKey((k) => k + 1)}
          />

          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Your Posts
            </h2>
            <PostsList providerId={provider.id} refreshKey={postsRefreshKey} />
          </div>
        </div>
      </div>
    </div>
  );
}
