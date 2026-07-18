import { prisma } from "@/lib/prisma";
import { resolveParticipant } from "@/lib/resolveParticipant";
import { NextResponse } from "next/server";
import { REPLIES_PAGE_SIZE } from "@/lib/commentPagination";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const { searchParams } = new URL(req.url);
  const cursor = searchParams.get("cursor");

  try {
    const replies = await prisma.comment.findMany({
      where: { parentId: id },
      orderBy: { createdAt: "asc" },
      take: REPLIES_PAGE_SIZE + 1,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    });

    const hasMore = replies.length > REPLIES_PAGE_SIZE;
    const page = hasMore ? replies.slice(0, REPLIES_PAGE_SIZE) : replies;

    const withAuthors = await Promise.all(
      page.map(async (r) => ({
        ...r,
        author: await resolveParticipant(r.authorId),
      })),
    );

    return NextResponse.json({
      replies: withAuthors,
      nextCursor: hasMore ? page[page.length - 1].id : null,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to fetch replies" },
      { status: 500 },
    );
  }
}
