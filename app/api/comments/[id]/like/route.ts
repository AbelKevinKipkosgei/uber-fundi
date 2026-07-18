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
    const existing = await prisma.commentLike.findUnique({
      where: { commentId_userId: { commentId: id, userId } },
    });

    if (existing) {
      await prisma.commentLike.delete({ where: { id: existing.id } });
    } else {
      await prisma.commentLike.create({ data: { commentId: id, userId } });
    }

    const likeCount = await prisma.commentLike.count({
      where: { commentId: id },
    });

    return NextResponse.json({ liked: !existing, likeCount });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to toggle like" },
      { status: 500 },
    );
  }
}
