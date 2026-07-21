"use client";

import { useState } from "react";
import { CldUploadWidget } from "next-cloudinary";
import { AlertCircle, CheckCircle2, ImagePlus, X } from "lucide-react";
import Image from "next/image";

type CategoryOption = { id: string; name: string };

export default function CreatePostForm({
  categoryOptions,
  onCreated,
}: {
  categoryOptions: CategoryOption[];
  onCreated: () => void;
}) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState(categoryOptions[0]?.id ?? "");
  const [images, setImages] = useState<string[]>([]);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const removeImage = (url: string) => {
    setImages((prev) => prev.filter((img) => img !== url));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(false);

    try {
      const res = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, description, categoryId, images }),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        setError(data?.error ?? "Failed to create post");
        return;
      }

      setTitle("");
      setDescription("");
      setImages([]);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 4000);
      onCreated();
    } catch (err) {
      console.error(err);
      setError("Failed to create post");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8 space-y-5"
    >
      <h2 className="text-lg font-semibold text-gray-900">Post Your Work</h2>

      {success && (
        <div className="flex items-start gap-2.5 rounded-xl bg-green-50 border border-green-200 p-4 text-green-700">
          <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />
          <span>Post published</span>
        </div>
      )}

      {error && (
        <div className="flex items-start gap-2.5 rounded-xl bg-red-50 border border-red-200 p-4 text-red-700">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <div>
        <label className="text-sm text-gray-600">Title</label>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. Full house rewiring in Kilimani"
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
          placeholder="Describe the job, materials used, timeline..."
          className="w-full mt-1 px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition text-gray-700 resize-none"
        />
      </div>

      <div>
        <label className="text-sm text-gray-600">Photos</label>

        {images.length > 0 && (
          <div className="mt-2 grid grid-cols-3 gap-2">
            {images.map((url) => (
              <div key={url} className="relative group w-full h-24">
                <Image
                  src={url}
                  alt="Uploaded work"
                  fill
                  className="object-cover rounded-xl border border-gray-200"
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
              Add photos (up to 5)
            </button>
          )}
        </CldUploadWidget>
      </div>

      <button
        type="submit"
        disabled={saving}
        className="w-full rounded-xl bg-blue-600 text-white py-3 font-medium shadow-md hover:bg-blue-700 transition disabled:opacity-60"
      >
        {saving ? "Publishing..." : "Publish Post"}
      </button>
    </form>
  );
}
