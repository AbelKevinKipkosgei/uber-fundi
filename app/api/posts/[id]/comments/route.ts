import { prisma } from "@/lib/prisma";
import { resolveParticipant } from "@/lib/resolveParticipant";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import {
  COMMENTS_PAGE_SIZE,
  REPLIES_PREVIEW_SIZE,
} from "@/lib/commentPagination";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const { searchParams } = new URL(req.url);
  const cursor = searchParams.get("cursor");

  try {
    const topLevel = await prisma.comment.findMany({
      where: { postId: id, parentId: null },
      orderBy: { createdAt: "asc" },
      take: COMMENTS_PAGE_SIZE + 1,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    });

    const hasMore = topLevel.length > COMMENTS_PAGE_SIZE;
    const page = hasMore ? topLevel.slice(0, COMMENTS_PAGE_SIZE) : topLevel;

    const withDetails = await Promise.all(
      page.map(async (comment) => {
        const [author, replies, replyCount] = await Promise.all([
          resolveParticipant(comment.authorId),
          prisma.comment.findMany({
            where: { parentId: comment.id },
            orderBy: { createdAt: "asc" },
            take: REPLIES_PREVIEW_SIZE,
          }),
          prisma.comment.count({ where: { parentId: comment.id } }),
        ]);

        const repliesWithAuthors = await Promise.all(
          replies.map(async (r) => ({
            ...r,
            author: await resolveParticipant(r.authorId),
          })),
        );

        return {
          ...comment,
          author,
          replies: repliesWithAuthors,
          replyCount,
        };
      }),
    );

    return NextResponse.json({
      comments: withDetails,
      nextCursor: hasMore ? page[page.length - 1].id : null,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to fetch comments" },
      { status: 500 },
    );
  }
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await req.json();
  const { text, parentId } = body;

  if (!text || typeof text !== "string" || !text.trim()) {
    return NextResponse.json(
      { error: "Comment cannot be empty" },
      { status: 400 },
    );
  }

  try {
    const post = await prisma.post.findUnique({
      where: { id },
      include: { provider: true },
    });

    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    // If replying, the parent must be a genuine TOP-LEVEL comment on this
    // same post — enforces our one-level-deep nesting rule.
    if (parentId) {
      const parent = await prisma.comment.findUnique({
        where: { id: parentId },
      });

      if (!parent || parent.postId !== id || parent.parentId !== null) {
        return NextResponse.json(
          { error: "Invalid comment to reply to" },
          { status: 400 },
        );
      }
    }

    const comment = await prisma.comment.create({
      data: {
        postId: id,
        authorId: userId,
        body: text.trim(),
        parentId: parentId || null,
      },
    });

    if (post.provider.clerkUserId !== userId) {
      await prisma.notification.create({
        data: {
          userId: post.provider.clerkUserId,
          type: "NEW_COMMENT",
          title: parentId
            ? "New reply on your post"
            : "New comment on your post",
          body: text.trim().slice(0, 100),
          link: `/posts/${id}`,
        },
      });
    }

    const author = await resolveParticipant(userId);

    return NextResponse.json({
      success: true,
      comment: { ...comment, author },
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to post comment" },
      { status: 500 },
    );
  }
}
