"use client";

import { useState } from "react";
import {
  Squares2X2Icon as OverviewOutline,
  FlagIcon as ReportsOutline,
  ShieldExclamationIcon as ProvidersOutline,
  UsersIcon as UsersOutline,
} from "@heroicons/react/24/outline";
import {
  Squares2X2Icon as OverviewSolid,
  FlagIcon as ReportsSolid,
  ShieldExclamationIcon as ProvidersSolid,
  UsersIcon as UsersSolid,
} from "@heroicons/react/24/solid";
import OverviewTab from "@/components/admin/OverviewTab";
import ReportsTab from "@/components/admin/ReportsTab";
import ProvidersTab from "@/components/admin/ProvidersTab";
import UsersTab from "@/components/admin/UsersTab";

const TABS = [
  {
    id: "overview",
    label: "Overview",
    outlineIcon: OverviewOutline,
    solidIcon: OverviewSolid,
  },
  {
    id: "reports",
    label: "Reports",
    outlineIcon: ReportsOutline,
    solidIcon: ReportsSolid,
  },
  {
    id: "providers",
    label: "Providers",
    outlineIcon: ProvidersOutline,
    solidIcon: ProvidersSolid,
  },
  {
    id: "users",
    label: "Users",
    outlineIcon: UsersOutline,
    solidIcon: UsersSolid,
  },
] as const;

type TabId = (typeof TABS)[number]["id"];

function AdminTabButton({
  label,
  active,
  outlineIcon: OutlineIcon,
  solidIcon: SolidIcon,
  onClick,
}: {
  label: string;
  active: boolean;
  outlineIcon: React.ElementType;
  solidIcon: React.ElementType;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`group flex flex-col items-center gap-1 px-3 sm:px-4 py-2.5 text-sm whitespace-nowrap shrink-0 transition-colors duration-200 ${
        active
          ? "text-gray-600 font-medium"
          : "text-gray-600 hover:text-gray-600"
      }`}
    >
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

      <span className="relative inline-block">
        <span className="text-[11px] leading-none">{label}</span>
        <span
          className={`absolute -bottom-2 left-0 h-1 w-full rounded-full bg-gray-600 transition-all duration-300 ${
            active ? "opacity-100 scale-x-100" : "opacity-0 scale-x-0"
          }`}
        />
      </span>
    </button>
  );
}

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<TabId>("overview");

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 via-white to-blue-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-8 sm:pt-12 pb-20">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">
          Admin Dashboard
        </h1>

        <div className="flex gap-2 mb-6 border-b border-gray-200">
          {TABS.map((tab) => (
            <AdminTabButton
              key={tab.id}
              label={tab.label}
              active={activeTab === tab.id}
              outlineIcon={tab.outlineIcon}
              solidIcon={tab.solidIcon}
              onClick={() => setActiveTab(tab.id)}
            />
          ))}
        </div>

        <div className="overflow-x-hidden">
          {activeTab === "overview" && <OverviewTab />}
          {activeTab === "reports" && <ReportsTab />}
          {activeTab === "providers" && <ProvidersTab />}
          {activeTab === "users" && <UsersTab />}
        </div>
      </div>
    </div>
  );
}
