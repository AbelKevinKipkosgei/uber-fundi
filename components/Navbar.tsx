"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { SignInButton, SignUpButton, UserButton, useUser } from "@clerk/nextjs";
import {
  HomeIcon as HomeOutline,
  WrenchScrewdriverIcon as WrenchOutline,
  Squares2X2Icon as DashboardOutline,
  ChatBubbleLeftRightIcon as ChatOutline,
  ShieldCheckIcon as ShieldOutline,
  BriefcaseIcon as BriefcaseOutline,
  MagnifyingGlassIcon,
  Bars3Icon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import {
  HomeIcon as HomeSolid,
  WrenchScrewdriverIcon as WrenchSolid,
  Squares2X2Icon as DashboardSolid,
  ChatBubbleLeftRightIcon as ChatSolid,
  ShieldCheckIcon as ShieldSolid,
  BriefcaseIcon as BriefcaseSolid,
} from "@heroicons/react/24/solid";
import NotificationBell from "@/components/NotificationBell";
import SearchOverlay from "@/components/SearchOverlay";
import { useEffect, useState } from "react";
import Image from "next/image";

type NavItem = {
  href: string;
  label: string;
  outlineIcon: React.ElementType;
  solidIcon: React.ElementType;
  badge?: number;
};

function NavLink({
  href,
  active,
  outlineIcon: OutlineIcon,
  solidIcon: SolidIcon,
  label,
  badge,
}: {
  href: string;
  active: boolean;
  outlineIcon: React.ElementType;
  solidIcon: React.ElementType;
  label: string;
  badge?: number;
}) {
  return (
    <Link
      href={href}
      className={`group relative flex flex-col items-center gap-0.5 transition-colors duration-200 ${
        active
          ? "text-gray-600 font-medium"
          : "text-gray-600 hover:text-gray-600"
      }`}
    >
      {/* Icon */}
      <div className="relative h-5 w-5">
        <OutlineIcon
          className={`absolute inset-0 h-5 w-5 transition-all duration-200 ${
            active
              ? "opacity-0 scale-95"
              : "opacity-100 scale-100 group-hover:opacity-0 group-hover:scale-95"
          }`}
        />

        <SolidIcon
          className={`absolute inset-0 h-5 w-5 transition-all duration-200 ${
            active
              ? "opacity-100 scale-100"
              : "opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100"
          }`}
        />
      </div>

      {/* Label */}
      <span className="text-xs leading-none">{label}</span>

      {/* Active Indicator */}
      <span
        className={`absolute -bottom-2 left-0 h-1 w-full rounded-full bg-gray-600 transition-all duration-300 ${
          active ? "opacity-100 scale-x-100" : "opacity-0 scale-x-0"
        }`}
      />

      {/* Badge */}
      {!!badge && badge > 0 && (
        <span className="absolute -top-1.5 -right-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-semibold text-white">
          {badge > 9 ? "9+" : badge}
        </span>
      )}
    </Link>
  );
}

function MobileNavRow({
  href,
  active,
  outlineIcon: OutlineIcon,
  solidIcon: SolidIcon,
  label,
  badge,
  onClick,
}: {
  href: string;
  active: boolean;
  outlineIcon: React.ElementType;
  solidIcon: React.ElementType;
  label: string;
  badge?: number;
  onClick: () => void;
}) {
  const Icon = active ? SolidIcon : OutlineIcon;

  return (
    <Link
      href={href}
      onClick={onClick}
      className={`flex items-center gap-3 px-5 py-3 transition-colors ${
        active ? "bg-blue-50 text-gray-600" : "text-gray-700 hover:bg-gray-50"
      }`}
    >
      <Icon className="w-5 h-5" />
      <span className="text-sm font-medium flex-1">{label}</span>
      {!!badge && badge > 0 && (
        <span className="min-w-5 h-5 px-1.5 rounded-full bg-red-500 text-white text-xs font-semibold flex items-center justify-center">
          {badge > 9 ? "9+" : badge}
        </span>
      )}
    </Link>
  );
}

export default function Navbar() {
  const { isSignedIn, isLoaded, user } = useUser();
  const pathname = usePathname();

  const [hasProviderProfile, setHasProviderProfile] = useState<boolean | null>(
    null,
  );
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [unreadBookings, setUnreadBookings] = useState(0);
  const [showSearch, setShowSearch] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isAdminUser = user?.publicMetadata?.role === "admin";

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
      setUnreadMessages(0);
      return;
    }

    let cancelled = false;

    const fetchUnread = async () => {
      try {
        const res = await fetch("/api/conversations/unread-count");
        if (res.ok) {
          const data = await res.json();
          if (!cancelled) setUnreadMessages(data.count ?? 0);
        }
      } catch {
        // silent fail
      }
    };

    fetchUnread();
    const interval = setInterval(fetchUnread, 15000);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [isSignedIn]);

  useEffect(() => {
    if (!isSignedIn) {
      setUnreadBookings(0);
      return;
    }

    let cancelled = false;

    const fetchUnread = async () => {
      try {
        const res = await fetch("/api/bookings/unread-count");
        if (res.ok) {
          const data = await res.json();
          if (!cancelled) setUnreadBookings(data.count ?? 0);
        }
      } catch {
        // silent fail
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

  const navItems: NavItem[] = [
    {
      href: "/",
      label: "Home",
      outlineIcon: HomeOutline,
      solidIcon: HomeSolid,
    },
    {
      href: "/providers",
      label: "Services",
      outlineIcon: WrenchOutline,
      solidIcon: WrenchSolid,
    },
    ...(isSignedIn
      ? [
          {
            href: "/provider/dashboard",
            label: "Dashboard",
            outlineIcon: DashboardOutline,
            solidIcon: DashboardSolid,
          },
          {
            href: "/messages",
            label: "Messages",
            outlineIcon: ChatOutline,
            solidIcon: ChatSolid,
            badge: unreadMessages,
          },
          {
            href: "/bookings",
            label: "Bookings",
            outlineIcon: BriefcaseOutline,
            solidIcon: BriefcaseSolid,
            badge: unreadBookings,
          },
        ]
      : []),
    ...(isAdminUser
      ? [
          {
            href: "/admin",
            label: "Admin",
            outlineIcon: ShieldOutline,
            solidIcon: ShieldSolid,
          },
        ]
      : []),
  ];

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <header className="sticky top-0 z-50 border-b bg-white/90 backdrop-blur-md">
      <nav className="max-w-7xl mx-auto flex justify-between items-center px-4 py-4">
        <div className="flex items-center gap-4">
          {/* <Link href="/" className="text-xl font-bold text-gray-900">
            <span className="text-blue-600">Uber</span>Fundi
          </Link> */}

          <Link href="/" className="flex items-center gap-1 md:gap-2">
            <Image
              src="/icon1.png"
              alt="UberFundi"
              width={60}
              height={60}
              priority
              className="h-8 w-8"
            />

            <span className="text-lg md:text-xl font-bold text-gray-900 whitespace-nowrap">
              <span className="text-blue-600">Uber</span>Fundi
            </span>
          </Link>

          <button
            onClick={() => setShowSearch(true)}
            className="hidden sm:flex w-32 sm:w-40 md:w-70 items-center gap-2 px-3 py-1.5 rounded-full border border-gray-400 text-gray-500 text-sm hover:border-blue-300 hover:text-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition"
          >
            <MagnifyingGlassIcon className="w-4 h-4" />
            Search
          </button>
        </div>

        <div className="hidden lg:flex items-center gap-8 text-sm">
          {navItems.map((item) => (
            <NavLink
              key={item.href}
              href={item.href}
              active={isActive(item.href)}
              outlineIcon={item.outlineIcon}
              solidIcon={item.solidIcon}
              label={item.label}
              badge={item.badge}
            />
          ))}
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowSearch(true)}
            className="sm:hidden text-gray-500 hover:text-blue-600"
          >
            <MagnifyingGlassIcon className="w-5 h-5" />
          </button>

          {!isSignedIn ? (
            <>
              <SignInButton mode="modal">
                <button className="hidden sm:inline text-sm text-gray-700 hover:text-blue-600 transition">
                  Sign In
                </button>
              </SignInButton>

              <SignUpButton mode="modal">
                <button className="px-4 py-2 rounded-xl bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition">
                  Offer Services
                </button>
              </SignUpButton>
            </>
          ) : (
            <>
              <Link
                href={
                  hasProviderProfile ? "/provider/dashboard" : "/add-provider"
                }
                className="hidden lg:inline-block px-4 py-2 rounded-xl bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition"
              >
                {hasProviderProfile ? "Manage Services" : "Become a Provider"}
              </Link>

              <NotificationBell />
              <UserButton />
            </>
          )}

          <button
            onClick={() => setMobileMenuOpen((v) => !v)}
            className="lg:hidden text-gray-600 hover:text-blue-600"
          >
            {mobileMenuOpen ? (
              <XMarkIcon className="w-6 h-6" />
            ) : (
              <Bars3Icon className="w-6 h-6" />
            )}
          </button>
        </div>
      </nav>

      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-gray-100 bg-white">
          {navItems.map((item) => (
            <MobileNavRow
              key={item.href}
              href={item.href}
              active={isActive(item.href)}
              outlineIcon={item.outlineIcon}
              solidIcon={item.solidIcon}
              label={item.label}
              badge={item.badge}
              onClick={() => setMobileMenuOpen(false)}
            />
          ))}

          {isSignedIn && (
            <Link
              href={
                hasProviderProfile ? "/provider/dashboard" : "/add-provider"
              }
              onClick={() => setMobileMenuOpen(false)}
              className="block px-5 py-3 text-sm font-medium text-blue-600 border-t border-gray-100"
            >
              {hasProviderProfile ? "Manage Services" : "Become a Provider"}
            </Link>
          )}

          {!isSignedIn && (
            <div className="flex gap-3 px-5 py-3 border-t border-gray-100">
              <SignInButton mode="modal">
                <button className="flex-1 text-sm font-medium text-gray-700 border border-gray-200 rounded-xl py-2">
                  Sign In
                </button>
              </SignInButton>
              <SignUpButton mode="modal">
                <button className="flex-1 text-sm font-medium text-white bg-blue-600 rounded-xl py-2">
                  Offer Services
                </button>
              </SignUpButton>
            </div>
          )}
        </div>
      )}

      {showSearch && <SearchOverlay onClose={() => setShowSearch(false)} />}
    </header>
  );
}
