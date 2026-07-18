"use client";

import { useState } from "react";
import { Heart } from "lucide-react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";

export default function LikeButton({
  postId,
  initialLiked,
  initialCount,
}: {
  postId: string;
  initialLiked: boolean;
  initialCount: number;
}) {
  const { isSignedIn } = useUser();
  const router = useRouter();
  const [liked, setLiked] = useState(initialLiked);
  const [count, setCount] = useState(initialCount);
  const [pending, setPending] = useState(false);

  const handleToggle = async () => {
    if (!isSignedIn) {
      router.push("/sign-in");
      return;
    }

    if (pending) return;
    setPending(true);

    // Optimistic update — flip immediately, reconcile with the server after
    const nextLiked = !liked;
    setLiked(nextLiked);
    setCount((c) => (nextLiked ? c + 1 : c - 1));

    try {
      const res = await fetch(`/api/posts/${postId}/like`, { method: "POST" });

      if (res.ok) {
        const data = await res.json();
        setLiked(data.liked);
        setCount(data.likeCount);
      } else {
        // Revert on failure
        setLiked(!nextLiked);
        setCount((c) => (nextLiked ? c - 1 : c + 1));
      }
    } catch (err) {
      console.error(err);
      setLiked(!nextLiked);
      setCount((c) => (nextLiked ? c - 1 : c + 1));
    } finally {
      setPending(false);
    }
  };

  return (
    <button
      onClick={handleToggle}
      className={`inline-flex items-center gap-1.5 text-sm font-medium transition-colors ${
        liked ? "text-red-500" : "text-gray-500 hover:text-red-500"
      }`}
    >
      <Heart className={`w-5 h-5 ${liked ? "fill-red-500" : ""}`} />
      {count > 0 ? count : "Like"}
    </button>
  );
}
