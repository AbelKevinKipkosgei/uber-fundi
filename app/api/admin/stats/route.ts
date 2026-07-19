import { prisma } from "@/lib/prisma";
import { isAdmin } from "@/lib/isAdmin";
import { NextResponse } from "next/server";

export async function GET() {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const [providerCount, postCount, pendingReports, totalReports] =
      await Promise.all([
        prisma.provider.count(),
        prisma.post.count(),
        prisma.report.count({ where: { status: "PENDING" } }),
        prisma.report.count(),
      ]);

    return NextResponse.json({
      providerCount,
      postCount,
      pendingReports,
      totalReports,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to fetch stats" },
      { status: 500 },
    );
  }
}
