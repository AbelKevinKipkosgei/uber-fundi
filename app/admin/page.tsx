"use client";

import { useState } from "react";
import {
  LayoutDashboard,
  Flag,
  Users as UsersIcon,
  ShieldAlert,
} from "lucide-react";
import OverviewTab from "@/components/admin/OverviewTab";
import ReportsTab from "@/components/admin/ReportsTab";
import ProvidersTab from "@/components/admin/ProvidersTab";
import UsersTab from "@/components/admin/UsersTab";

const TABS = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "reports", label: "Reports", icon: Flag },
  { id: "providers", label: "Providers", icon: ShieldAlert },
  { id: "users", label: "Users", icon: UsersIcon },
] as const;

type TabId = (typeof TABS)[number]["id"];

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<TabId>("overview");

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 via-white to-blue-50">
      <div className="max-w-5xl mx-auto px-6 pt-12 pb-20">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">
          Admin Dashboard
        </h1>

        <div className="flex gap-2 mb-6 border-b border-gray-200">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 transition ${
                activeTab === tab.id
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === "overview" && <OverviewTab />}
        {activeTab === "reports" && <ReportsTab />}
        {activeTab === "providers" && <ProvidersTab />}
        {activeTab === "users" && <UsersTab />}
      </div>
    </div>
  );
}
