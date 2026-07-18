"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowLeft, ChevronLeft, ChevronRight, User } from "lucide-react";
import LikeButton from "@/components/LikeButton";
import CommentSection from "@/components/CommentSection";

type Post = {
  id: string;
  title: string;
  description: string | null;
  images: string[];
  createdAt: string;
  likeCount: number;
  isLikedByMe: boolean;
  category: { name: string };
  provider: {
    id: number;
    name: string;
    category: { slug: string; name: string };
  };
};

export default function PostDetailPage() {
  const params = useParams<{ id: string }>();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeImage, setActiveImage] = useState(0);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const res = await fetch(`/api/posts/${params.id}`);

        if (!res.ok) {
          const data = await res.json().catch(() => null);
          setError(data?.error ?? "Failed to load post");
          return;
        }

        const data = await res.json();
        setPost(data);
      } catch (err) {
        console.error(err);
        setError("Failed to load post");
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [params.id]);

  const nextImage = () => {
    if (!post) return;
    setActiveImage((i) => (i + 1) % post.images.length);
  };

  const prevImage = () => {
    if (!post) return;
    setActiveImage((i) => (i - 1 + post.images.length) % post.images.length);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-gray-50 via-white to-blue-50 px-6 py-14">
        <div className="max-w-3xl mx-auto space-y-6">
          <div className="h-8 w-40 bg-white rounded-lg animate-pulse border" />
          <div className="h-96 rounded-3xl bg-white animate-pulse border" />
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen bg-linear-to-br from-gray-50 via-white to-blue-50 flex items-center justify-center px-6">
        <div className="bg-white rounded-2xl border p-12 text-center shadow-sm max-w-md">
          <h2 className="text-xl font-semibold text-gray-900">
            {error ?? "Post not found"}
          </h2>
          <Link
            href="/providers"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-blue-600 hover:text-blue-700 mt-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to categories
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 via-white to-blue-50">
      <div className="max-w-3xl mx-auto px-6 pt-12 pb-20">
        <Link
          href={`/provider/${post.provider.id}`}
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to {post.provider.name}&apos;s profile
        </Link>

        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
          {post.images.length > 0 ? (
            <div className="relative bg-gray-100">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={post.images[activeImage]}
                alt={`${post.title} - photo ${activeImage + 1}`}
                className="w-full h-80 sm:h-96 object-cover"
              />

              {post.images.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/90 shadow-md flex items-center justify-center text-gray-700 hover:bg-white transition"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/90 shadow-md flex items-center justify-center text-gray-700 hover:bg-white transition"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>

                  <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                    {post.images.map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setActiveImage(i)}
                        className={`w-2 h-2 rounded-full transition ${
                          i === activeImage ? "bg-white" : "bg-white/50"
                        }`}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="w-full h-80 sm:h-96 bg-gray-50 flex items-center justify-center text-gray-300">
              No photos
            </div>
          )}

          {post.images.length > 1 && (
            <div className="flex gap-2 px-6 pt-4 overflow-x-auto">
              {post.images.map((img, i) => (
                <button
                  key={img}
                  onClick={() => setActiveImage(i)}
                  className={`shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition ${
                    i === activeImage ? "border-blue-600" : "border-transparent"
                  }`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={img}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}

          <div className="p-8">
            <span className="inline-block px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-medium mb-3">
              {post.category.name}
            </span>

            <h1 className="text-2xl font-bold text-gray-900">{post.title}</h1>
            <div className="mt-3">
              <LikeButton
                postId={post.id}
                initialLiked={post.isLikedByMe}
                initialCount={post.likeCount}
              />
            </div>

            {post.description && (
              <p className="mt-4 text-gray-700 leading-relaxed whitespace-pre-line">
                {post.description}
              </p>
            )}

            <Link
              href={`/provider/${post.provider.id}`}
              className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-blue-600 transition"
            >
              <User className="w-4 h-4" />
              Posted by {post.provider.name}
            </Link>
          </div>
          <div className="border-t border-gray-100 p-8">
            <CommentSection postId={post.id} />
          </div>
        </div>
      </div>
    </div>
  );
}
