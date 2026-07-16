"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { useEffect, useRef, useState } from "react";
import { ArrowLeft, Send } from "lucide-react";

type Message = {
  id: string;
  conversationId: string;
  senderId: string;
  body: string;
  createdAt: string;
};

const POLL_INTERVAL_MS = 4000;

export default function ConversationThreadPage() {
  const params = useParams<{ conversationId: string }>();
  const { user } = useUser();

  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);

  const bottomRef = useRef<HTMLDivElement>(null);

  const fetchMessages = async () => {
    try {
      const res = await fetch(
        `/api/conversations/${params.conversationId}/messages`,
      );

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        setError(data?.error ?? "Failed to load messages");
        return;
      }

      const data: Message[] = await res.json();
      setMessages(data);
      setError(null);
    } catch (err) {
      console.error(err);
      setError("Failed to load messages");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, POLL_INTERVAL_MS);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.conversationId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!draft.trim()) return;

    setSending(true);
    const text = draft.trim();
    setDraft("");

    try {
      const res = await fetch(
        `/api/conversations/${params.conversationId}/messages`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text }),
        },
      );

      if (res.ok) {
        await fetchMessages();
      } else {
        setDraft(text);
        const data = await res.json().catch(() => null);
        setError(data?.error ?? "Failed to send message");
      }
    } catch (err) {
      console.error(err);
      setDraft(text);
      setError("Failed to send message");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-linear-to-br from-gray-50 via-white to-blue-50">
      <div className="max-w-2xl w-full mx-auto flex flex-col flex-1 px-4 sm:px-6 pt-6 pb-4">
        <Link
          href="/messages"
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          All conversations
        </Link>

        <div className="flex-1 bg-white rounded-3xl border border-gray-100 shadow-sm flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto px-5 py-6 space-y-3 min-h-[50vh] max-h-[65vh]">
            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="h-10 w-2/3 rounded-2xl bg-gray-100 animate-pulse"
                  />
                ))}
              </div>
            ) : messages.length === 0 ? (
              <p className="text-center text-sm text-gray-400 py-10">
                No messages yet. Say hello 👋
              </p>
            ) : (
              messages.map((msg) => {
                const isMe = msg.senderId === user?.id;
                return (
                  <div
                    key={msg.id}
                    className={`flex ${isMe ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm ${
                        isMe
                          ? "bg-blue-600 text-white rounded-br-md"
                          : "bg-gray-100 text-gray-800 rounded-bl-md"
                      }`}
                    >
                      {msg.body}
                      <div
                        className={`text-[10px] mt-1 ${
                          isMe ? "text-blue-100" : "text-gray-400"
                        }`}
                      >
                        {new Date(msg.createdAt).toLocaleTimeString("en-KE", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={bottomRef} />
          </div>

          {error && (
            <div className="px-5 py-2 text-xs text-red-600 bg-red-50 border-t border-red-100">
              {error}
            </div>
          )}

          <form
            onSubmit={handleSend}
            className="flex items-center gap-2 border-t border-gray-100 p-3"
          >
            <input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="Type a message..."
              className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition text-sm text-gray-700"
            />
            <button
              type="submit"
              disabled={sending || !draft.trim()}
              className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center hover:bg-blue-700 transition disabled:opacity-50 shrink-0"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
