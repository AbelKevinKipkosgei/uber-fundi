import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { serializeProviders } from "@/lib/serializers/provider";

export async function GET() {
  try {
    const providers = await prisma.provider.findMany({
      where: {
        suspended: false,
        isAvailable: true,
        rating: { gt: 0 },
      },
      include: {
        category: true,
      },
      orderBy: [{ rating: "desc" }, { createdAt: "desc" }],
      take: 6,
    });

    return NextResponse.json(serializeProviders(providers));
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Failed to fetch featured providers" },
      { status: 500 },
    );
  }
}
