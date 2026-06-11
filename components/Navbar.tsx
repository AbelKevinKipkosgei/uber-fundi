"use client";

import Link from "next/link";
import { SignInButton, SignUpButton, UserButton, useUser } from "@clerk/nextjs";

export default function Navbar() {
  const { isSignedIn, isLoaded } = useUser();
  if (!isLoaded) return null; // or a loading spinner

  return (
    <header className="sticky top-0 z-50 border-b bg-white/70 backdrop-blur-md">
      <nav className="max-w-6xl mx-auto flex justify-between items-center px-6 py-4">
        {/* BRAND */}
        <Link href="/" className="text-xl font-bold text-gray-900">
          <span className="text-blue-600">Service</span>Finder
        </Link>

        {/* LINKS */}
        <div className="hidden md:flex items-center gap-6 text-sm">
          <Link href="/providers" className="text-gray-600 hover:text-blue-600">
            Browse Categories
          </Link>
        </div>

        {/* AUTH / CTA */}
        <div className="flex items-center gap-3">
          {!isSignedIn ? (
            <>
              {/* SIGN IN */}
              <SignInButton mode="modal">
                <button className="text-sm text-gray-700 hover:text-blue-600 transition">
                  Sign In
                </button>
              </SignInButton>

              {/* PROTECTED CTA */}
              <SignUpButton mode="modal">
                <button className="px-4 py-2 rounded-xl bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition">
                  Become a Provider
                </button>
              </SignUpButton>
            </>
          ) : (
            <>
              {/* SIGNED IN → DIRECT LINK */}
              <Link
                href="/add-provider"
                className="px-4 py-2 rounded-xl bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition"
              >
                Become a Provider
              </Link>

              <UserButton />
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
