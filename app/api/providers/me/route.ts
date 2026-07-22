// app/api/providers/me/route.ts
import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { parseBody } from "@/lib/validate";
import { updateProviderSchema } from "@/lib/schemas";
import { resolveProviderImage } from "@/lib/resolveProviderImage";

export async function GET() {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const provider = await prisma.provider.findUnique({
      where: { clerkUserId: userId },
      include: {
        category: true,
        subcategories: { include: { category: true } },
      },
    });

    if (!provider) {
      return NextResponse.json(
        { error: "No provider profile found for this account" },
        { status: 404 },
      );
    }

    return NextResponse.json(provider);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to fetch provider profile" },
      { status: 500 },
    );
  }
}

export async function PATCH(req: Request) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const parsed = await parseBody(req, updateProviderSchema);
  if ("error" in parsed) return parsed.error;
  const { name, phone, bio, imageUrl, isAvailable, subcategoryIds } =
    parsed.data;

  try {
    const existing = await prisma.provider.findUnique({
      where: { clerkUserId: userId },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "No provider profile found for this account" },
        { status: 404 },
      );
    }

    let subIds: string[] | undefined;

    if (Array.isArray(subcategoryIds)) {
      subIds = subcategoryIds;

      const validSubcategories = await prisma.category.findMany({
        where: { id: { in: subIds }, parentId: existing.categoryId },
        select: { id: true },
      });

      if (validSubcategories.length !== subIds.length) {
        return NextResponse.json(
          { error: "One or more subcategories do not belong to your category" },
          { status: 400 },
        );
      }
    }

    const provider = await prisma.$transaction(async (tx: any) => {
      if (subIds) {
        await tx.providerSubcategory.deleteMany({
          where: { providerId: existing.id },
        });

        if (subIds.length > 0) {
          await tx.providerSubcategory.createMany({
            data: subIds.map((categoryId) => ({
              providerId: existing.id,
              categoryId,
            })),
          });
        }
      }

      return tx.provider.update({
        where: { id: existing.id },
        data: {
          ...(name !== undefined ? { name } : {}),
          ...(phone !== undefined ? { phone } : {}),
          ...(bio !== undefined ? { bio: bio || null } : {}),
          ...(imageUrl !== undefined
            ? { imageUrl: await resolveProviderImage(userId, imageUrl) }
            : {}),
          ...(isAvailable !== undefined ? { isAvailable } : {}),
        },
        include: {
          category: true,
          subcategories: { include: { category: true } },
        },
      });
    });

    return NextResponse.json({ success: true, provider });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to update provider profile" },
      { status: 500 },
    );
  }
}
