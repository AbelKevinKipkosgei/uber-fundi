import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

const PAGE_SIZE = 12;

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get("q")?.trim();
  const cursor = searchParams.get("cursor");

  if (!query || query.length < 2) {
    return NextResponse.json({ providers: [], nextCursor: null });
  }

  try {
    const providers = await prisma.provider.findMany({
      where: {
        suspended: false,
        OR: [
          { name: { contains: query, mode: "insensitive" } },
          { bio: { contains: query, mode: "insensitive" } },
          { category: { name: { contains: query, mode: "insensitive" } } },
        ],
      },
      include: {
        category: true,
        subcategories: { include: { category: true } },
      },
      orderBy: [{ rating: "desc" }, { createdAt: "desc" }],
      take: PAGE_SIZE + 1,
      ...(cursor ? { cursor: { id: parseInt(cursor, 10) }, skip: 1 } : {}),
    });

    const hasMore = providers.length > PAGE_SIZE;
    const page = hasMore ? providers.slice(0, PAGE_SIZE) : providers;

    return NextResponse.json({
      providers: page,
      nextCursor: hasMore ? page[page.length - 1].id : null,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Search failed" }, { status: 500 });
  }
}
