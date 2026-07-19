"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { useEffect, useRef, useState } from "react";
import { ArrowLeft, Send, Check, CheckCheck, Flag } from "lucide-react";
import { pusherClient } from "@/lib/pusherClient";
import ReportModal from "@/components/ReportModal";

type Message = {
  id: string;
  conversationId: string;
  senderId: string;
  body: string;
  readAt: string | null;
  createdAt: string;
};

type OtherParticipant = {
  clerkUserId: string;
  name: string;
  imageUrl: string | null;
};

export default function ConversationThreadPage() {
  const params = useParams<{ conversationId: string }>();
  const { user } = useUser();

  const [otherParticipant, setOtherParticipant] =
    useState<OtherParticipant | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);

  const bottomRef = useRef<HTMLDivElement>(null);

  const [showReport, setShowReport] = useState(false);

  // Initial load: conversation header + message history (GET also marks unread as read)
  useEffect(() => {
    const load = async () => {
      try {
        const [convRes, msgRes] = await Promise.all([
          fetch(`/api/conversations/${params.conversationId}`),
          fetch(`/api/conversations/${params.conversationId}/messages`),
        ]);

        if (convRes.ok) {
          const convData = await convRes.json();
          setOtherParticipant(convData.otherParticipant);
        }

        if (msgRes.ok) {
          const msgData: Message[] = await msgRes.json();
          setMessages(msgData);
        } else {
          const data = await msgRes.json().catch(() => null);
          setError(data?.error ?? "Failed to load messages");
        }
      } catch (err) {
        console.error(err);
        setError("Failed to load conversation");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [params.conversationId]);

  // Real-time subscription
  useEffect(() => {
    const channelName = `private-conversation-${params.conversationId}`;
    const channel = pusherClient.subscribe(channelName);

    channel.bind("new-message", (message: Message) => {
      setMessages((prev) => {
        if (prev.some((m) => m.id === message.id)) return prev;
        return [...prev, message];
      });

      // If the incoming message is from the other participant and I have
      // this thread open, immediately mark it read and let them know.
      if (message.senderId !== user?.id) {
        fetch(`/api/conversations/${params.conversationId}/messages`).catch(
          console.error,
        );
      }
    });

    channel.bind(
      "messages-read",
      (data: { readerId: string; messageIds: string[]; readAt: string }) => {
        if (data.readerId === user?.id) return; // ignore my own read events
        setMessages((prev) =>
          prev.map((m) =>
            data.messageIds.includes(m.id) ? { ...m, readAt: data.readAt } : m,
          ),
        );
      },
    );

    return () => {
      pusherClient.unsubscribe(channelName);
    };
  }, [params.conversationId, user?.id]);

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

      if (!res.ok) {
        setDraft(text);
        const data = await res.json().catch(() => null);
        setError(data?.error ?? "Failed to send message");
      }
      // No need to manually append here — the Pusher "new-message" event does it,
      // including for the sender's own tab, since we don't exclude by socket_id.
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
          {/* HEADER — who you're chatting with */}
          <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100">
            <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 font-semibold flex items-center justify-center shrink-0">
              {otherParticipant?.name.charAt(0).toUpperCase() ?? "?"}
            </div>
            <p className="font-medium text-gray-900 flex-1">
              {otherParticipant?.name ?? "Loading..."}
            </p>
            <button
              onClick={() => setShowReport(true)}
              className="text-xs text-gray-400 hover:text-red-500 transition"
            >
              <Flag className="w-4 h-4" />
            </button>
          </div>

          {showReport && (
            <ReportModal
              target={{ conversationId: params.conversationId }}
              onClose={() => setShowReport(false)}
            />
          )}

          <div className="flex-1 overflow-y-auto px-5 py-6 space-y-3 min-h-[45vh] max-h-[60vh]">
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
                        className={`flex items-center gap-1 text-[10px] mt-1 ${
                          isMe ? "text-blue-100 justify-end" : "text-gray-400"
                        }`}
                      >
                        {new Date(msg.createdAt).toLocaleTimeString("en-KE", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                        {isMe &&
                          (msg.readAt ? (
                            <CheckCheck className="w-3.5 h-3.5" />
                          ) : (
                            <Check className="w-3.5 h-3.5" />
                          ))}
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
