"use client";

import { useEffect, useState } from "react";
import { Users, FileImage, Flag, AlertCircle } from "lucide-react";

type Stats = {
  providerCount: number;
  postCount: number;
  pendingReports: number;
  totalReports: number;
};

export default function OverviewTab() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/stats")
      .then((r) => r.json())
      .then(setStats)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-28 rounded-2xl bg-gray-100 animate-pulse" />
        ))}
      </div>
    );
  }

  if (!stats) {
    return <p className="text-sm text-gray-500">Failed to load stats.</p>;
  }

  const cards = [
    {
      label: "Providers",
      value: stats.providerCount,
      icon: Users,
      color: "text-blue-500",
    },
    {
      label: "Posts",
      value: stats.postCount,
      icon: FileImage,
      color: "text-green-500",
    },
    {
      label: "Pending Reports",
      value: stats.pendingReports,
      icon: AlertCircle,
      color: "text-red-500",
    },
    {
      label: "Total Reports",
      value: stats.totalReports,
      icon: Flag,
      color: "text-gray-500",
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {cards.map((card) => (
        <div
          key={card.label}
          className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5"
        >
          <card.icon className={`w-5 h-5 ${card.color} mb-2`} />
          <p className="text-2xl font-bold text-gray-900">{card.value}</p>
          <p className="text-sm text-gray-500">{card.label}</p>
        </div>
      ))}
    </div>
  );
}
