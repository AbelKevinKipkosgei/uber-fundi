"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Trash2, Heart, MessageCircle } from "lucide-react";
import ConfirmDialog from "@/components/ConfirmDialog";
import Image from "next/image";

type Post = {
  id: string;
  title: string;
  description: string | null;
  images: string[];
  createdAt: string;
  likeCount: number;
  commentCount: number;
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
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

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

  const requestDelete = (id: string) => {
    setPendingDeleteId(id);
  };

  const confirmDelete = async () => {
    if (!pendingDeleteId) return;
    const id = pendingDeleteId;
    setPendingDeleteId(null);

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
        <Link
          key={post.id}
          href={`/provider/dashboard/posts/${post.id}`}
          className="rounded-2xl border border-gray-100 overflow-hidden group relative block hover:shadow-md transition"
        >
          {post.images[0] ? (
            // eslint-disable-next-line @next/next/no-img-element
            <Image
              src={post.images[0]}
              alt={post.title}
              width={400}
              height={128}
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
            <div className="flex items-center gap-3 mt-2">
              <span className="flex items-center gap-1 text-xs text-gray-500">
                <Heart className="w-3 h-3" />
                {post.likeCount}
              </span>
              <span className="flex items-center gap-1 text-xs text-gray-500">
                <MessageCircle className="w-3 h-3" />
                {post.commentCount}
              </span>
            </div>
          </div>

          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              requestDelete(post.id);
            }}
            disabled={deletingId === post.id}
            className="absolute top-2 right-2 w-8 h-8 rounded-full bg-white/90 shadow-sm flex items-center justify-center text-gray-500 hover:text-red-600 opacity-0 group-hover:opacity-100 transition disabled:opacity-60"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </Link>
      ))}
      {pendingDeleteId && (
        <ConfirmDialog
          title="Delete this post?"
          message="This will permanently remove the post and its photos. This can't be undone."
          onConfirm={confirmDelete}
          onCancel={() => setPendingDeleteId(null)}
        />
      )}
    </div>
  );
}
