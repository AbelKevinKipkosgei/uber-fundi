import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function DELETE(
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

    if (comment.authorId !== userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Get any replies so we can clean up their likes too, since a top-level
    // delete cascades to its replies.
    const replies = await prisma.comment.findMany({
      where: { parentId: id },
      select: { id: true },
    });
    const replyIds = replies.map((r) => r.id);
    const allCommentIds = [id, ...replyIds];

    // Likes must go first — the foreign key from comment_likes to comments
    // is RESTRICT, so Postgres blocks deleting a comment that still has
    // likes pointing at it.
    await prisma.commentLike.deleteMany({
      where: { commentId: { in: allCommentIds } },
    });

    await prisma.comment.deleteMany({ where: { parentId: id } });
    await prisma.comment.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to delete comment" },
      { status: 500 },
    );
  }
}
