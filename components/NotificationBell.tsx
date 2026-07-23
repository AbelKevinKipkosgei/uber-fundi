"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
// import { Bell, MessageSquare, Star, Heart, CheckCheck } from "lucide-react";
import { MessageSquare, Star, Heart, CheckCheck } from "lucide-react";

import { BellIcon as BellOutline } from "@heroicons/react/24/outline";

import { BellIcon as BellSolid } from "@heroicons/react/24/solid";

type Notification = {
  id: string;
  type: string;
  title: string;
  body: string | null;
  link: string | null;
  read: boolean;
  createdAt: string;
};

const POLL_INTERVAL_MS = 15000;

function iconForType(type: string) {
  switch (type) {
    case "NEW_COMMENT":
    case "NEW_REPLY":
      return MessageSquare;
    case "NEW_RATING":
      return Star;
    case "COMMENT_LIKED":
    case "POST_LIKED":
      return Heart;
    default:
      return BellOutline;
  }
}

export default function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const fetchNotifications = async () => {
    try {
      const res = await fetch("/api/notifications");
      if (res.ok) {
        const data = await res.json();
        setNotifications(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleNotificationClick = async (notification: Notification) => {
    setOpen(false);
    if (!notification.read) {
      setNotifications((prev) =>
        prev.map((n) => (n.id === notification.id ? { ...n, read: true } : n)),
      );
      fetch(`/api/notifications/${notification.id}/read`, {
        method: "PATCH",
      }).catch(console.error);
    }
  };

  const handleMarkAllRead = async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    try {
      await fetch("/api/notifications/mark-all-read", { method: "POST" });
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="relative" ref={containerRef}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="group relative flex h-9 w-9 items-center justify-center rounded-full text-gray-600 transition hover:bg-gray-100"
      >
        <div className="relative h-5 w-5">
          <BellOutline
            className={`absolute inset-0 h-5 w-5 transition-all duration-200 ${
              open
                ? "opacity-0 scale-95"
                : "opacity-100 scale-100 group-hover:opacity-0 group-hover:scale-95"
            }`}
          />

          <BellSolid
            className={`absolute inset-0 h-5 w-5 transition-all duration-200 ${
              open
                ? "opacity-100 scale-100"
                : "opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100"
            }`}
          />
        </div>

        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex h-4.5 min-w-4.5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-semibold text-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="fixed sm:absolute left-1/2 sm:left-auto sm:right-0 top-16 sm:top-auto -translate-x-1/2 sm:translate-x-0 sm:mt-2 w-[90vw] max-w-80 sm:w-80 bg-white rounded-2xl border border-gray-100 shadow-xl overflow-hidden z-50">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
            <p className="font-medium text-gray-900 text-sm">Notifications</p>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                Mark all read
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-8">
                No notifications yet
              </p>
            ) : (
              notifications.map((n) => {
                const Icon = iconForType(n.type);
                return (
                  <Link
                    key={n.id}
                    href={n.link ?? "#"}
                    onClick={() => handleNotificationClick(n)}
                    className={`flex items-start gap-3 px-4 py-3 hover:bg-gray-50 transition border-b border-gray-50 last:border-0 ${
                      !n.read ? "bg-blue-50/50" : ""
                    }`}
                  >
                    <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-gray-900">
                        {n.title}
                      </p>
                      {n.body && (
                        <p className="text-xs text-gray-500 truncate mt-0.5">
                          {n.body}
                        </p>
                      )}
                      <p className="text-[10px] text-gray-400 mt-1">
                        {new Date(n.createdAt).toLocaleString("en-KE", {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                    {!n.read && (
                      <span className="w-2 h-2 rounded-full bg-blue-600 shrink-0 mt-1.5" />
                    )}
                  </Link>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
