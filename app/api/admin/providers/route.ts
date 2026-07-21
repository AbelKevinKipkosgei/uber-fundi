import { prisma } from "@/lib/prisma";
import { isAdmin } from "@/lib/isAdmin";
import { NextResponse } from "next/server";

const PAGE_SIZE = 20;

export async function GET(req: Request) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const query = searchParams.get("query")?.trim();
  const cursor = searchParams.get("cursor");

  try {
    const providers = await prisma.provider.findMany({
      where: query
        ? {
            OR: [
              { name: { contains: query, mode: "insensitive" } },
              { phone: { contains: query, mode: "insensitive" } },
              { category: { name: { contains: query, mode: "insensitive" } } },
            ],
          }
        : {},
      include: { category: true },
      orderBy: { createdAt: "desc" },
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
    return NextResponse.json(
      { error: "Failed to fetch providers" },
      { status: 500 },
    );
  }
}
