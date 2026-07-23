import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const [providerCount, categoryCount, completedBookings] = await Promise.all(
      [
        prisma.provider.count({ where: { suspended: false } }),
        prisma.category.count({ where: { parentId: null } }),
        prisma.booking.count({ where: { status: "COMPLETED" } }),
      ],
    );

    return NextResponse.json({
      providerCount,
      categoryCount,
      completedBookings,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to fetch stats" },
      { status: 500 },
    );
  }
}
