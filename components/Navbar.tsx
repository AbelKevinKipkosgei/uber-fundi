"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { SignInButton, SignUpButton, UserButton, useUser } from "@clerk/nextjs";
import {
  WrenchScrewdriverIcon as WrenchOutline,
  Squares2X2Icon as DashboardOutline,
  ChatBubbleLeftRightIcon as ChatOutline,
} from "@heroicons/react/24/outline";
import {
  WrenchScrewdriverIcon as WrenchSolid,
  Squares2X2Icon as DashboardSolid,
  ChatBubbleLeftRightIcon as ChatSolid,
} from "@heroicons/react/24/solid";
import NotificationBell from "@/components/NotificationBell";
import { useEffect, useState } from "react";

function NavLink({
  href,
  active,
  outlineIcon: OutlineIcon,
  solidIcon: SolidIcon,
  label,
}: {
  href: string;
  active: boolean;
  outlineIcon: React.ElementType;
  solidIcon: React.ElementType;
  label: string;
}) {
  const Icon = active ? SolidIcon : OutlineIcon;

  return (
    <Link
      href={href}
      className={`flex items-center gap-1.5 transition-colors ${
        active
          ? "text-gray-600 font-medium"
          : "text-gray-600 hover:text-blue-600"
      }`}
    >
      <Icon className="w-4.5 h-4.5" />
      {label}
    </Link>
  );
}

export default function Navbar() {
  const { isSignedIn, isLoaded } = useUser();
  const pathname = usePathname();
  const [hasProviderProfile, setHasProviderProfile] = useState<boolean | null>(
    null,
  );
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!isSignedIn) {
      setHasProviderProfile(null);
      return;
    }

    let cancelled = false;

    const checkProfile = async () => {
      try {
        const res = await fetch("/api/providers/me");
        if (!cancelled) setHasProviderProfile(res.ok);
      } catch {
        if (!cancelled) setHasProviderProfile(false);
      }
    };

    checkProfile();

    return () => {
      cancelled = true;
    };
  }, [isSignedIn]);

  useEffect(() => {
    if (!isSignedIn) {
      setUnreadCount(0);
      return;
    }

    let cancelled = false;

    const fetchUnread = async () => {
      try {
        const res = await fetch("/api/conversations/unread-count");
        if (res.ok) {
          const data = await res.json();
          if (!cancelled) setUnreadCount(data.count ?? 0);
        }
      } catch {
        // silent fail — badge just won't update this cycle
      }
    };

    fetchUnread();
    const interval = setInterval(fetchUnread, 15000);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [isSignedIn]);

  if (!isLoaded) return null;

  return (
    <header className="sticky top-0 z-50 border-b bg-white/90 backdrop-blur-md">
      <nav className="max-w-6xl mx-auto flex justify-between items-center px-6 py-4">
        <Link href="/" className="text-xl font-bold text-gray-900">
          <span className="text-blue-600">Uber</span>Fundi
        </Link>

        <div className="hidden md:flex items-center gap-6 text-sm">
          <NavLink
            href="/providers"
            active={pathname.startsWith("/providers")}
            outlineIcon={WrenchOutline}
            solidIcon={WrenchSolid}
            label="Services"
          />
          {isSignedIn && (
            <NavLink
              href="/provider/dashboard"
              active={pathname.startsWith("/provider/dashboard")}
              outlineIcon={DashboardOutline}
              solidIcon={DashboardSolid}
              label="Dashboard"
            />
          )}
          {isSignedIn && (
            <NavLink
              href="/messages"
              active={pathname.startsWith("/messages")}
              outlineIcon={ChatOutline}
              solidIcon={ChatSolid}
              label="Messages"
            />
          )}
        </div>

        <div className="flex items-center gap-3">
          {!isSignedIn ? (
            <>
              <SignInButton mode="modal">
                <button className="text-sm text-gray-700 hover:text-blue-600 transition">
                  Sign In
                </button>
              </SignInButton>

              <SignUpButton mode="modal">
                <button className="px-4 py-2 rounded-xl bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition">
                  Become a Provider
                </button>
              </SignUpButton>
            </>
          ) : (
            <>
              <Link
                href={
                  hasProviderProfile ? "/provider/dashboard" : "/add-provider"
                }
                className="hidden sm:inline-block px-4 py-2 rounded-xl bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition"
              >
                {hasProviderProfile ? "Manage Services" : "Become a Provider"}
              </Link>

              <NotificationBell />
              <UserButton />
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
