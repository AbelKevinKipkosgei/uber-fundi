import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  try {
    const comment = await prisma.comment.findUnique({ where: { id } });

    if (!comment) {
      return NextResponse.json({ error: "Comment not found" }, { status: 404 });
    }

    const existing = await prisma.commentLike.findUnique({
      where: { commentId_userId: { commentId: id, userId } },
    });

    let liked: boolean;

    if (existing) {
      await prisma.commentLike.delete({ where: { id: existing.id } });
      liked = false;
    } else {
      await prisma.commentLike.create({ data: { commentId: id, userId } });
      liked = true;

      // Only notify when someone LIKES a comment, not when they unlike it —
      // and never notify someone about liking their own comment.
      if (comment.authorId !== userId) {
        await prisma.notification.create({
          data: {
            userId: comment.authorId,
            type: "COMMENT_LIKED",
            title: "Someone liked your comment",
            body: comment.body.slice(0, 100),
            link: `/posts/${comment.postId}`,
          },
        });
      }
    }

    const likeCount = await prisma.commentLike.count({
      where: { commentId: id },
    });

    return NextResponse.json({ liked, likeCount });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to toggle like" },
      { status: 500 },
    );
  }
}
