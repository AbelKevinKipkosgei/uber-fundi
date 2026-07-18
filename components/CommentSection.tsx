"use client";

import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { Trash2, CornerDownRight, Heart } from "lucide-react";
import ConfirmDialog from "@/components/ConfirmDialog";
import { request } from "http";

type Author = { clerkUserId: string; name: string; imageUrl: string | null };

type Reply = {
  id: string;
  body: string;
  createdAt: string;
  author: Author;
  likeCount: number;
  isLikedByMe: boolean;
};

type TopLevelComment = {
  id: string;
  body: string;
  createdAt: string;
  author: Author;
  replies: Reply[];
  replyCount: number;
  likeCount: number;
  isLikedByMe: boolean;
};

function timeAgo(dateStr: string) {
  const diffMs = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  return `${days}d`;
}

function useCommentLikeToggle(
  setComments: React.Dispatch<React.SetStateAction<TopLevelComment[]>>,
) {
  return async (commentId: string, isReply: boolean, parentId?: string) => {
    // Optimistic flip
    setComments((prev) =>
      prev.map((c) => {
        if (!isReply && c.id === commentId) {
          return {
            ...c,
            isLikedByMe: !c.isLikedByMe,
            likeCount: c.isLikedByMe ? c.likeCount - 1 : c.likeCount + 1,
          };
        }
        if (isReply && c.id === parentId) {
          return {
            ...c,
            replies: c.replies.map((r) =>
              r.id === commentId
                ? {
                    ...r,
                    isLikedByMe: !r.isLikedByMe,
                    likeCount: r.isLikedByMe
                      ? r.likeCount - 1
                      : r.likeCount + 1,
                  }
                : r,
            ),
          };
        }
        return c;
      }),
    );

    try {
      const res = await fetch(`/api/comments/${commentId}/like`, {
        method: "POST",
      });
      if (!res.ok) throw new Error("failed");
      const data = await res.json();

      // Reconcile with server truth
      setComments((prev) =>
        prev.map((c) => {
          if (!isReply && c.id === commentId) {
            return { ...c, isLikedByMe: data.liked, likeCount: data.likeCount };
          }
          if (isReply && c.id === parentId) {
            return {
              ...c,
              replies: c.replies.map((r) =>
                r.id === commentId
                  ? { ...r, isLikedByMe: data.liked, likeCount: data.likeCount }
                  : r,
              ),
            };
          }
          return c;
        }),
      );
    } catch (err) {
      console.error(err);
      // silently leave the optimistic state — acceptable for a low-stakes like toggle
    }
  };
}

function ReplyRow({
  reply,
  onDelete,
  onToggleLike,
  currentUserId,
}: {
  reply: Reply;
  onDelete: (id: string) => void;
  onToggleLike: (id: string) => void;
  currentUserId: string | null | undefined;
}) {
  return (
    <div className="flex items-start gap-2 pl-8">
      <div className="w-6 h-6 rounded-full bg-gray-100 text-gray-600 text-xs font-semibold flex items-center justify-center shrink-0">
        {reply.author.name.charAt(0).toUpperCase()}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs">
          <span className="font-medium text-gray-900">{reply.author.name}</span>{" "}
          <span className="text-gray-400">{timeAgo(reply.createdAt)}</span>
        </p>
        <p className="text-sm text-gray-700">{reply.body}</p>
        <button
          onClick={() => onToggleLike(reply.id)}
          className={`flex items-center gap-1 text-xs mt-1 transition-colors ${
            reply.isLikedByMe
              ? "text-red-500"
              : "text-gray-400 hover:text-red-500"
          }`}
        >
          <Heart
            className={`w-3 h-3 ${reply.isLikedByMe ? "fill-red-500" : ""}`}
          />
          {reply.likeCount > 0 ? reply.likeCount : "Like"}
        </button>
      </div>
      {reply.author.clerkUserId === currentUserId && (
        <button
          onClick={() => onDelete(reply.id)}
          className="text-gray-300 hover:text-red-500 transition shrink-0"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
}

export default function CommentSection({ postId }: { postId: string }) {
  const { user, isSignedIn } = useUser();
  const router = useRouter();

  const [comments, setComments] = useState<TopLevelComment[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const [newComment, setNewComment] = useState("");
  const [posting, setPosting] = useState(false);

  const [replyDrafts, setReplyDrafts] = useState<Record<string, string>>({});
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [postingReply, setPostingReply] = useState<string | null>(null);

  const [loadingRepliesFor, setLoadingRepliesFor] = useState<string | null>(
    null,
  );
  const [replyCursors, setReplyCursors] = useState<
    Record<string, string | null>
  >({});
  const toggleCommentLike = useCommentLikeToggle(setComments);
  const [pendingDelete, setPendingDelete] = useState<{
    id: string;
    isReply: boolean;
    parentId?: string;
  } | null>(null);

  const loadInitial = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/posts/${postId}/comments`);
      const data = await res.json();
      setComments(data.comments ?? []);
      setNextCursor(data.nextCursor ?? null);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInitial();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [postId]);

  const loadMoreComments = async () => {
    if (!nextCursor) return;
    setLoadingMore(true);
    try {
      const res = await fetch(
        `/api/posts/${postId}/comments?cursor=${nextCursor}`,
      );
      const data = await res.json();
      setComments((prev) => [...prev, ...(data.comments ?? [])]);
      setNextCursor(data.nextCursor ?? null);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingMore(false);
    }
  };

  const loadMoreReplies = async (parentId: string) => {
    setLoadingRepliesFor(parentId);
    try {
      const cursor = replyCursors[parentId];
      const url = cursor
        ? `/api/comments/${parentId}/replies?cursor=${cursor}`
        : `/api/comments/${parentId}/replies`;
      const res = await fetch(url);
      const data = await res.json();

      setComments((prev) =>
        prev.map((c) =>
          c.id === parentId
            ? { ...c, replies: [...c.replies, ...(data.replies ?? [])] }
            : c,
        ),
      );
      setReplyCursors((prev) => ({
        ...prev,
        [parentId]: data.nextCursor ?? null,
      }));
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingRepliesFor(null);
    }
  };

  const handlePostComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isSignedIn) {
      router.push("/sign-in");
      return;
    }
    if (!newComment.trim()) return;

    setPosting(true);
    try {
      const res = await fetch(`/api/posts/${postId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: newComment }),
      });

      if (res.ok) {
        const data = await res.json();
        setComments((prev) => [
          { ...data.comment, replies: [], replyCount: 0 },
          ...prev,
        ]);
        setNewComment("");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setPosting(false);
    }
  };

  const handlePostReply = async (parentId: string) => {
    const text = replyDrafts[parentId];
    if (!text?.trim()) return;

    setPostingReply(parentId);
    try {
      const res = await fetch(`/api/posts/${postId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, parentId }),
      });

      if (res.ok) {
        const data = await res.json();
        setComments((prev) =>
          prev.map((c) =>
            c.id === parentId
              ? {
                  ...c,
                  replies: [...c.replies, data.comment],
                  replyCount: c.replyCount + 1,
                }
              : c,
          ),
        );
        setReplyDrafts((prev) => ({ ...prev, [parentId]: "" }));
        setReplyingTo(null);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setPostingReply(null);
    }
  };

  const requestDelete = (id: string, isReply: boolean, parentId?: string) => {
    setPendingDelete({ id, isReply, parentId });
  };

  const confirmDelete = async () => {
    if (!pendingDelete) return;
    const { id, isReply, parentId } = pendingDelete;
    setPendingDelete(null);

    try {
      const res = await fetch(`/api/comments/${id}`, { method: "DELETE" });
      if (!res.ok) return;

      if (isReply && parentId) {
        setComments((prev) =>
          prev.map((c) =>
            c.id === parentId
              ? {
                  ...c,
                  replies: c.replies.filter((r) => r.id !== id),
                  replyCount: Math.max(0, c.replyCount - 1),
                }
              : c,
          ),
        );
      } else {
        setComments((prev) => prev.filter((c) => c.id !== id));
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div>
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Comments</h2>

      <form onSubmit={handlePostComment} className="flex gap-2 mb-6">
        <input
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder={isSignedIn ? "Add a comment..." : "Sign in to comment"}
          className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-700"
        />
        <button
          type="submit"
          disabled={posting || !newComment.trim()}
          className="px-4 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition disabled:opacity-60"
        >
          Post
        </button>
      </form>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-12 rounded-xl bg-gray-100 animate-pulse"
            />
          ))}
        </div>
      ) : comments.length === 0 ? (
        <p className="text-sm text-gray-500 text-center py-6">
          No comments yet. Be the first to say something.
        </p>
      ) : (
        <div className="space-y-5">
          {comments.map((comment) => (
            <div key={comment.id}>
              <div className="flex items-start gap-2.5">
                <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 text-sm font-semibold flex items-center justify-center shrink-0">
                  {comment.author.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm">
                    <span className="font-medium text-gray-900">
                      {comment.author.name}
                    </span>{" "}
                    <span className="text-gray-400 text-xs">
                      {timeAgo(comment.createdAt)}
                    </span>
                  </p>
                  <p className="text-sm text-gray-700 mt-0.5">{comment.body}</p>
                  <div className="flex items-center gap-3 mt-1">
                    <button
                      onClick={() => toggleCommentLike(comment.id, false)}
                      className={`flex items-center gap-1 text-xs transition-colors ${
                        comment.isLikedByMe
                          ? "text-red-500"
                          : "text-gray-500 hover:text-red-500"
                      }`}
                    >
                      <Heart
                        className={`w-3.5 h-3.5 ${comment.isLikedByMe ? "fill-red-500" : ""}`}
                      />
                      {comment.likeCount > 0 ? comment.likeCount : "Like"}
                    </button>
                    <button
                      onClick={() =>
                        setReplyingTo(
                          replyingTo === comment.id ? null : comment.id,
                        )
                      }
                      className="flex items-center gap-1 text-xs text-gray-500 hover:text-blue-600"
                    >
                      <CornerDownRight className="w-3 h-3" />
                      Reply
                    </button>
                  </div>
                </div>
                {comment.author.clerkUserId === user?.id && (
                  <button
                    onClick={() => requestDelete(comment.id, false)}
                    className="text-gray-300 hover:text-red-500 transition shrink-0"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>

              {replyingTo === comment.id && (
                <div className="flex gap-2 mt-2 pl-11">
                  <input
                    value={replyDrafts[comment.id] ?? ""}
                    onChange={(e) =>
                      setReplyDrafts((prev) => ({
                        ...prev,
                        [comment.id]: e.target.value,
                      }))
                    }
                    placeholder={`Reply to ${comment.author.name}...`}
                    className="flex-1 px-3 py-2 rounded-lg border border-gray-200 text-sm text-gray-700"
                  />
                  <button
                    onClick={() => handlePostReply(comment.id)}
                    disabled={
                      postingReply === comment.id ||
                      !replyDrafts[comment.id]?.trim()
                    }
                    className="px-3 py-2 rounded-lg bg-blue-600 text-white text-xs font-medium disabled:opacity-60"
                  >
                    Reply
                  </button>
                </div>
              )}

              {comment.replies.length > 0 && (
                <div className="mt-3 space-y-3">
                  {comment.replies.map((reply) => (
                    <ReplyRow
                      key={reply.id}
                      reply={reply}
                      currentUserId={user?.id}
                      onDelete={(id) => requestDelete(id, true, comment.id)}
                      onToggleLike={(id) =>
                        toggleCommentLike(id, true, comment.id)
                      }
                    />
                  ))}
                </div>
              )}

              {comment.replyCount > comment.replies.length && (
                <button
                  onClick={() => loadMoreReplies(comment.id)}
                  disabled={loadingRepliesFor === comment.id}
                  className="pl-8 mt-2 text-xs font-medium text-gray-500 hover:text-blue-600 transition"
                >
                  {loadingRepliesFor === comment.id
                    ? "Loading..."
                    : `View ${comment.replyCount - comment.replies.length} more ${
                        comment.replyCount - comment.replies.length === 1
                          ? "reply"
                          : "replies"
                      }`}
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {nextCursor && (
        <button
          onClick={loadMoreComments}
          disabled={loadingMore}
          className="mt-6 w-full text-center text-sm font-medium text-gray-600 hover:text-blue-600 py-2 border-t border-gray-100 transition"
        >
          {loadingMore ? "Loading..." : "Load more comments"}
        </button>
      )}
      {pendingDelete && (
        <ConfirmDialog
          title="Delete comment?"
          message="This can't be undone. Any replies to it will also be deleted."
          onConfirm={confirmDelete}
          onCancel={() => setPendingDelete(null)}
        />
      )}
    </div>
  );
}
