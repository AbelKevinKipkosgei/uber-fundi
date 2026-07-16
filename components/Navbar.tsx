"use client";

import Link from "next/link";
import { SignInButton, SignUpButton, UserButton, useUser } from "@clerk/nextjs";
import { LayoutDashboard, Compass, MessageSquare } from "lucide-react";
import { useEffect, useState } from "react";

export default function Navbar() {
  const { isSignedIn, isLoaded } = useUser();
  const [hasProviderProfile, setHasProviderProfile] = useState<boolean | null>(
    null,
  );

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

  if (!isLoaded) return null; // or a loading spinner

  return (
    <header className="sticky top-0 z-50 border-b bg-white/70 backdrop-blur-md">
      <nav className="max-w-6xl mx-auto flex justify-between items-center px-6 py-4">
        {/* BRAND */}
        <Link href="/" className="text-xl font-bold text-gray-900">
          <span className="text-blue-600">Uber</span>Fundi
        </Link>

        {/* LINKS */}
        <div className="hidden md:flex items-center gap-6 text-sm">
          <Link
            href="/providers"
            className="flex items-center gap-1.5 text-gray-600 hover:text-blue-600"
          >
            <Compass className="w-4 h-4" />
            Services
          </Link>
          {isSignedIn && (
            <Link
              href="/provider/dashboard"
              className="flex items-center gap-1.5 text-gray-600 hover:text-blue-600"
            >
              <LayoutDashboard className="w-4 h-4" />
              Dashboard
            </Link>
          )}
          {isSignedIn && (
            <Link
              href="/messages"
              className="flex items-center gap-1.5 text-gray-600 hover:text-blue-600"
            >
              <MessageSquare className="w-4 h-4" />
              Messages
            </Link>
          )}
        </div>

        {/* AUTH / CTA */}
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

              <UserButton />
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
