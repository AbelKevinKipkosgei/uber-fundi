import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { parseBody } from "@/lib/validate";
import { createProviderSchema } from "@/lib/schemas";

export async function POST(req: Request) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const parsed = await parseBody(req, createProviderSchema);
  if ("error" in parsed) return parsed.error;
  const { name, phone, bio, categoryId, subcategoryIds, latitude, longitude } =
    parsed.data;

  // Ensure the chosen category is actually a top-level (main) category,
  // not a subcategory being mistakenly used as the main one.
  const category = await prisma.category.findUnique({
    where: { id: categoryId },
  });

  if (!category || category.parentId !== null) {
    return NextResponse.json(
      { error: "Invalid main category" },
      { status: 400 },
    );
  }

  // If subcategories were provided, make sure each one actually belongs
  // to the chosen main category — prevents mismatched data (e.g. picking
  // "Electrical" as the main category but "Deep Cleaning" as a subcategory).
  const subIds: string[] = Array.isArray(subcategoryIds) ? subcategoryIds : [];

  if (subIds.length > 0) {
    const validSubcategories = await prisma.category.findMany({
      where: { id: { in: subIds }, parentId: categoryId },
      select: { id: true },
    });

    if (validSubcategories.length !== subIds.length) {
      return NextResponse.json(
        {
          error:
            "One or more subcategories do not belong to the selected category",
        },
        { status: 400 },
      );
    }
  }

  try {
    const provider = await prisma.provider.create({
      data: {
        clerkUserId: userId,
        name,
        phone,
        bio: bio || null,
        latitude,
        longitude,
        category: { connect: { id: categoryId } },
        subcategories: {
          create: subIds.map((subId) => ({
            category: { connect: { id: subId } },
          })),
        },
      },
      include: {
        category: true,
        subcategories: { include: { category: true } },
      },
    });

    return NextResponse.json({ success: true, provider });
  } catch (error: unknown) {
    // Prisma unique constraint violation — this user already has a provider profile
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      (error as { code?: string }).code === "P2002"
    ) {
      return NextResponse.json(
        { error: "You already have a provider profile" },
        { status: 409 },
      );
    }

    console.error(error);
    return NextResponse.json(
      { error: "Failed to create provider" },
      { status: 500 },
    );
  }
}
