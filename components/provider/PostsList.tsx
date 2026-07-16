"use client";

import { useEffect, useState } from "react";
import { Trash2 } from "lucide-react";

type Post = {
  id: string;
  title: string;
  description: string | null;
  images: string[];
  createdAt: string;
  category: { name: string };
};

export default function PostsList({
  providerId,
  refreshKey,
}: {
  providerId: number;
  refreshKey: number;
}) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/posts?providerId=${providerId}`);
        const data = await res.json();
        setPosts(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, [providerId, refreshKey]);

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      const res = await fetch(`/api/posts/${id}`, { method: "DELETE" });
      if (res.ok) {
        setPosts((prev) => prev.filter((p) => p.id !== id));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-2 gap-4">
        {[1, 2].map((i) => (
          <div key={i} className="h-40 rounded-2xl bg-gray-100 animate-pulse" />
        ))}
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <p className="text-sm text-gray-500 text-center py-6">
        You haven&apos;t posted any work yet. Use the form above to add your
        first post.
      </p>
    );
  }

  return (
    <div className="grid sm:grid-cols-2 gap-4">
      {posts.map((post) => (
        <div
          key={post.id}
          className="rounded-2xl border border-gray-100 overflow-hidden group relative"
        >
          {post.images[0] ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={post.images[0]}
              alt={post.title}
              className="w-full h-32 object-cover"
            />
          ) : (
            <div className="w-full h-32 bg-gray-50 flex items-center justify-center text-gray-300 text-sm">
              No photo
            </div>
          )}

          <div className="p-4">
            <p className="font-medium text-gray-900 text-sm truncate">
              {post.title}
            </p>
            <p className="text-xs text-gray-500 mt-0.5">{post.category.name}</p>
          </div>

          <button
            onClick={() => handleDelete(post.id)}
            disabled={deletingId === post.id}
            className="absolute top-2 right-2 w-8 h-8 rounded-full bg-white/90 shadow-sm flex items-center justify-center text-gray-500 hover:text-red-600 opacity-0 group-hover:opacity-100 transition disabled:opacity-60"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
}
