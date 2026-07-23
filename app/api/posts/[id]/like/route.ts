// import { prisma } from "@/lib/prisma";
// import { auth } from "@clerk/nextjs/server";
// import { NextResponse } from "next/server";

// export async function POST(
//   req: Request,
//   { params }: { params: Promise<{ id: string }> },
// ) {
//   const { userId } = await auth();

//   if (!userId) {
//     return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
//   }

//   const { id } = await params;

//   try {
//     const existing = await prisma.like.findUnique({
//       where: { postId_userId: { postId: id, userId } },
//     });

//     if (existing) {
//       await prisma.like.delete({ where: { id: existing.id } });
//     } else {
//       await prisma.like.create({ data: { postId: id, userId } });
//     }

//     const likeCount = await prisma.like.count({ where: { postId: id } });

//     return NextResponse.json({ liked: !existing, likeCount });
//   } catch (error) {
//     console.error(error);
//     return NextResponse.json(
//       { error: "Failed to toggle like" },
//       { status: 500 },
//     );
//   }
// }

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
    const post = await prisma.post.findUnique({
      where: { id },
      include: { provider: true },
    });

    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    const existing = await prisma.like.findUnique({
      where: { postId_userId: { postId: id, userId } },
    });

    let liked: boolean;

    if (existing) {
      await prisma.like.delete({ where: { id: existing.id } });
      liked = false;
    } else {
      await prisma.like.create({ data: { postId: id, userId } });
      liked = true;

      // Only notify on a genuine like, and never for liking your own post
      if (post.provider.clerkUserId !== userId) {
        await prisma.notification.create({
          data: {
            userId: post.provider.clerkUserId,
            type: "POST_LIKED",
            title: "Someone liked your post",
            body: post.title.slice(0, 100),
            link: `/posts/${id}`,
          },
        });
      }
    }

    const likeCount = await prisma.like.count({ where: { postId: id } });

    return NextResponse.json({ liked, likeCount });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to toggle like" },
      { status: 500 },
    );
  }
}
