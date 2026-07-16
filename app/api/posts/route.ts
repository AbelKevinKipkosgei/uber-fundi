// app/api/posts/route.ts
import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

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
      include: { category: true },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(posts);
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

  const body = await req.json();
  const { title, description, categoryId, images } = body;

  if (!title || !categoryId) {
    return NextResponse.json(
      { error: "Title and category are required" },
      { status: 400 },
    );
  }

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
