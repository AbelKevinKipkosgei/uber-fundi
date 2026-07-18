import { prisma } from "@/lib/prisma";
import { resolveParticipant } from "@/lib/resolveParticipant";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import {
  COMMENTS_PAGE_SIZE,
  REPLIES_PREVIEW_SIZE,
} from "@/lib/commentPagination";

async function withLikeData(commentId: string, userId: string | null) {
  const [likeCount, isLikedByMe] = await Promise.all([
    prisma.commentLike.count({ where: { commentId } }),
    userId
      ? prisma.commentLike
          .findUnique({ where: { commentId_userId: { commentId, userId } } })
          .then((r) => !!r)
      : Promise.resolve(false),
  ]);

  return { likeCount, isLikedByMe };
}

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { userId } = await auth();
  const { id } = await params;
  const { searchParams } = new URL(req.url);
  const cursor = searchParams.get("cursor");

  try {
    const topLevel = await prisma.comment.findMany({
      where: { postId: id, parentId: null },
      orderBy: { createdAt: "desc" },
      take: COMMENTS_PAGE_SIZE + 1,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    });

    const hasMore = topLevel.length > COMMENTS_PAGE_SIZE;
    const page = hasMore ? topLevel.slice(0, COMMENTS_PAGE_SIZE) : topLevel;

    const withDetails = await Promise.all(
      page.map(async (comment) => {
        const [author, replies, replyCount, likeData] = await Promise.all([
          resolveParticipant(comment.authorId),
          prisma.comment.findMany({
            where: { parentId: comment.id },
            orderBy: { createdAt: "asc" },
            take: REPLIES_PREVIEW_SIZE,
          }),
          prisma.comment.count({ where: { parentId: comment.id } }),
          withLikeData(comment.id, userId),
        ]);

        const repliesWithDetails = await Promise.all(
          replies.map(async (r) => ({
            ...r,
            author: await resolveParticipant(r.authorId),
            ...(await withLikeData(r.id, userId)),
          })),
        );

        return {
          ...comment,
          author,
          replies: repliesWithDetails,
          replyCount,
          ...likeData,
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

    let parentComment = null;

    if (parentId) {
      parentComment = await prisma.comment.findUnique({
        where: { id: parentId },
      });

      if (
        !parentComment ||
        parentComment.postId !== id ||
        parentComment.parentId !== null
      ) {
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

    // Notify the people who should know about this — avoiding duplicate/self notifications
    const notifyTargets = new Set<string>();

    if (post.provider.clerkUserId !== userId) {
      notifyTargets.add(post.provider.clerkUserId);
    }

    if (parentComment && parentComment.authorId !== userId) {
      notifyTargets.add(parentComment.authorId);
    }

    await Promise.all(
      Array.from(notifyTargets).map((targetUserId) =>
        prisma.notification.create({
          data: {
            userId: targetUserId,
            type: parentId ? "NEW_REPLY" : "NEW_COMMENT",
            title:
              parentId && parentComment?.authorId === targetUserId
                ? "Someone replied to your comment"
                : parentId
                  ? "New reply on your post"
                  : "New comment on your post",
            body: text.trim().slice(0, 100),
            link: `/posts/${id}`,
          },
        }),
      ),
    );

    const author = await resolveParticipant(userId);

    return NextResponse.json({
      success: true,
      comment: { ...comment, author, likeCount: 0, isLikedByMe: false },
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to post comment" },
      { status: 500 },
    );
  }
}
