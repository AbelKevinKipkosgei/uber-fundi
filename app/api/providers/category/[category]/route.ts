import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

const PAGE_SIZE = 12;

export async function GET(
  req: Request,
  { params }: { params: Promise<{ category: string }> },
) {
  try {
    const { category: slug } = await params;
    const { searchParams } = new URL(req.url);
    const subSlug = searchParams.get("sub");
    const cursor = searchParams.get("cursor");

    const category = await prisma.category.findUnique({ where: { slug } });

    if (!category) {
      return NextResponse.json(
        { error: "Category not found" },
        { status: 404 },
      );
    }

    let subcategoryId: string | null = null;

    if (subSlug) {
      const subcategory = await prisma.category.findUnique({
        where: { slug: subSlug },
      });

      if (!subcategory || subcategory.parentId !== category.id) {
        return NextResponse.json(
          { error: "Invalid subcategory for this category" },
          { status: 400 },
        );
      }

      subcategoryId = subcategory.id;
    }

    const providers = await prisma.provider.findMany({
      where: {
        categoryId: category.id,
        suspended: false,
        ...(subcategoryId
          ? { subcategories: { some: { categoryId: subcategoryId } } }
          : {}),
      },
      include: {
        category: true,
        subcategories: { include: { category: true } },
      },
      orderBy: [{ rating: "desc" }, { createdAt: "desc" }],
      take: PAGE_SIZE + 1,
      ...(cursor ? { cursor: { id: parseInt(cursor, 10) }, skip: 1 } : {}),
    });

    const hasMore = providers.length > PAGE_SIZE;
    const page = hasMore ? providers.slice(0, PAGE_SIZE) : providers;

    return NextResponse.json({
      providers: page,
      nextCursor: hasMore ? page[page.length - 1].id : null,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to fetch providers" },
      { status: 500 },
    );
  }
}
