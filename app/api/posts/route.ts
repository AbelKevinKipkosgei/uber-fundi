// app/api/posts/route.ts
import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { parseBody } from "@/lib/validate";
import { createPostSchema } from "@/lib/schemas";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const providerId = searchParams.get("providerId");

  if (!providerId || Number.isNaN(parseInt(providerId, 10))) {
    return NextResponse.json(
      { error: "Missing or invalid providerId" },
      { status: 400 },
    );
  }

  try {
    const posts = await prisma.post.findMany({
      where: { providerId: parseInt(providerId, 10) },
      include: {
        category: true,
        _count: { select: { likes: true, comments: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    const formatted = posts.map((p) => ({
      ...p,
      likeCount: p._count.likes,
      commentCount: p._count.comments,
    }));

    return NextResponse.json(formatted);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to fetch posts" },
      { status: 500 },
    );
  }
}

export async function POST(req: Request) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const parsed = await parseBody(req, createPostSchema);
  if ("error" in parsed) return parsed.error;
  const { title, description, categoryId, images } = parsed.data;

  try {
    const provider = await prisma.provider.findUnique({
      where: { clerkUserId: userId },
      include: { subcategories: true },
    });

    if (!provider) {
      return NextResponse.json(
        { error: "You need a provider profile before posting work" },
        { status: 404 },
      );
    }

    const allowedCategoryIds = new Set([
      provider.categoryId,
      ...provider.subcategories.map((s) => s.categoryId),
    ]);

    if (!allowedCategoryIds.has(categoryId)) {
      return NextResponse.json(
        { error: "You can only post work under a service you offer" },
        { status: 400 },
      );
    }

    const post = await prisma.post.create({
      data: {
        providerId: provider.id,
        categoryId,
        title,
        description: description || null,
        images: Array.isArray(images) ? images : [],
      },
      include: { category: true },
    });

    return NextResponse.json({ success: true, post });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to create post" },
      { status: 500 },
    );
  }
}
