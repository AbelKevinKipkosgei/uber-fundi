import { prisma } from "@/lib/prisma";
import { resolveParticipant } from "@/lib/resolveParticipant";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { REPLIES_PAGE_SIZE } from "@/lib/commentPagination";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { userId } = await auth();
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

    const withDetails = await Promise.all(
      page.map(async (r) => {
        const [author, likeCount, isLikedByMe] = await Promise.all([
          resolveParticipant(r.authorId),
          prisma.commentLike.count({ where: { commentId: r.id } }),
          userId
            ? prisma.commentLike
                .findUnique({
                  where: { commentId_userId: { commentId: r.id, userId } },
                })
                .then((x) => !!x)
            : Promise.resolve(false),
        ]);

        return { ...r, author, likeCount, isLikedByMe };
      }),
    );

    return NextResponse.json({
      replies: withDetails,
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
