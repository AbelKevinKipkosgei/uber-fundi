"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { CldUploadWidget } from "next-cloudinary";
import {
  ArrowLeft,
  AlertCircle,
  CheckCircle2,
  ImagePlus,
  X,
  Trash2,
  ExternalLink,
} from "lucide-react";
import ConfirmDialog from "@/components/ConfirmDialog";

type CategoryOption = { id: string; name: string };

type Post = {
  id: string;
  title: string;
  description: string | null;
  images: string[];
  category: { id: string; name: string };
  providerId: number;
};

export default function EditPostPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [categoryOptions, setCategoryOptions] = useState<CategoryOption[]>([]);

  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const [deleting, setDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const [postRes, meRes] = await Promise.all([
          fetch(`/api/posts/${params.id}`),
          fetch("/api/providers/me"),
        ]);

        if (!postRes.ok) {
          const data = await postRes.json().catch(() => null);
          setLoadError(data?.error ?? "Failed to load post");
          return;
        }

        const post: Post = await postRes.json();
        setTitle(post.title);
        setDescription(post.description ?? "");
        setCategoryId(post.category.id);
        setImages(post.images);

        if (meRes.ok) {
          const me = await meRes.json();
          setCategoryOptions([
            { id: me.category.id, name: me.category.name },
            ...me.subcategories.map(
              (s: { category: CategoryOption }) => s.category,
            ),
          ]);
        }
      } catch (err) {
        console.error(err);
        setLoadError("Failed to load post");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [params.id]);

  const removeImage = (url: string) => {
    setImages((prev) => prev.filter((img) => img !== url));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaveError(null);
    setSaveSuccess(false);

    try {
      const res = await fetch(`/api/posts/${params.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, description, categoryId, images }),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        setSaveError(data?.error ?? "Failed to save changes");
        return;
      }

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 4000);
    } catch (err) {
      console.error(err);
      setSaveError("Failed to save changes");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const res = await fetch(`/api/posts/${params.id}`, { method: "DELETE" });
      if (res.ok) {
        router.push("/provider/dashboard");
      } else {
        const data = await res.json().catch(() => null);
        setSaveError(data?.error ?? "Failed to delete post");
      }
    } catch (err) {
      console.error(err);
      setSaveError("Failed to delete post");
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-gray-50 via-white to-blue-50 px-6 py-14">
        <div className="max-w-xl mx-auto space-y-6">
          <div className="h-8 w-40 bg-white rounded-lg animate-pulse border" />
          <div className="h-96 rounded-3xl bg-white animate-pulse border" />
        </div>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="min-h-screen bg-linear-to-br from-gray-50 via-white to-blue-50 flex items-center justify-center px-6">
        <div className="bg-white rounded-2xl border p-10 text-center shadow-sm max-w-md">
          <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-3" />
          <p className="text-gray-700">{loadError}</p>
          <Link
            href="/provider/dashboard"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-blue-600 hover:text-blue-700 mt-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 via-white to-blue-50">
      <div className="max-w-xl mx-auto px-6 pt-12 pb-20">
        <div className="flex items-center justify-between mb-6">
          <Link
            href="/provider/dashboard"
            className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700"
          >
            <ArrowLeft className="w-4 h-4" />
            Dashboard
          </Link>

          <Link
            href={`/posts/${params.id}`}
            target="_blank"
            className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-blue-600"
          >
            View public post
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </div>

        <form
          onSubmit={handleSave}
          className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8 space-y-5"
        >
          <h1 className="text-lg font-semibold text-gray-900">Edit Post</h1>

          {saveSuccess && (
            <div className="flex items-start gap-2.5 rounded-xl bg-green-50 border border-green-200 p-4 text-green-700">
              <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />
              <span>Changes saved</span>
            </div>
          )}

          {saveError && (
            <div className="flex items-start gap-2.5 rounded-xl bg-red-50 border border-red-200 p-4 text-red-700">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <span>{saveError}</span>
            </div>
          )}

          <div>
            <label className="text-sm text-gray-600">Title</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full mt-1 px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition text-gray-700"
            />
          </div>

          <div>
            <label className="text-sm text-gray-600">Service</label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              required
              className="w-full mt-1 px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition text-gray-700"
            >
              {categoryOptions.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-sm text-gray-600">
              Description <span className="text-gray-400">(optional)</span>
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full mt-1 px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition text-gray-700 resize-none"
            />
          </div>

          <div>
            <label className="text-sm text-gray-600">Photos</label>

            {images.length > 0 && (
              <div className="mt-2 grid grid-cols-3 gap-2">
                {images.map((url) => (
                  <div key={url} className="relative group">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={url}
                      alt="Post"
                      className="w-full h-24 object-cover rounded-xl border border-gray-200"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(url)}
                      className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <CldUploadWidget
              signatureEndpoint="/api/sign-cloudinary-params"
              options={{ multiple: true, maxFiles: 5, resourceType: "image" }}
              onSuccess={(result) => {
                if (
                  typeof result.info === "object" &&
                  result.info &&
                  "secure_url" in result.info
                ) {
                  setImages((prev) => [
                    ...prev,
                    (result.info as { secure_url: string }).secure_url,
                  ]);
                }
              }}
            >
              {({ open }) => (
                <button
                  type="button"
                  onClick={() => open()}
                  className="mt-2 w-full flex items-center justify-center gap-2 rounded-xl border border-dashed border-gray-300 py-4 text-sm text-gray-500 hover:border-blue-300 hover:text-blue-600 transition"
                >
                  <ImagePlus className="w-4 h-4" />
                  Add more photos
                </button>
              )}
            </CldUploadWidget>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 rounded-xl bg-blue-600 text-white py-3 font-medium shadow-md hover:bg-blue-700 transition disabled:opacity-60"
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
            <button
              type="button"
              onClick={() => setShowDeleteConfirm(true)}
              disabled={deleting}
              className="px-4 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 transition disabled:opacity-60"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </div>
        </form>
      </div>
      {showDeleteConfirm && (
        <ConfirmDialog
          title="Delete this post?"
          message="This will permanently remove the post and its photos. This can't be undone."
          onConfirm={() => {
            setShowDeleteConfirm(false);
            handleDelete();
          }}
          onCancel={() => setShowDeleteConfirm(false)}
        />
      )}
    </div>
  );
}
