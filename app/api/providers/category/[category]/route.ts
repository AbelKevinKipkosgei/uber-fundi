import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ category: string }> },
) {
  try {
    const { category: slug } = await params;
    const { searchParams } = new URL(req.url);
    const subSlug = searchParams.get("sub");

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

      // Guard against a subcategory slug that doesn't actually belong to this category
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
        ...(subcategoryId
          ? { subcategories: { some: { categoryId: subcategoryId } } }
          : {}),
      },
      include: {
        category: true,
        subcategories: { include: { category: true } },
      },
      orderBy: [{ rating: "desc" }, { createdAt: "desc" }],
    });

    return NextResponse.json(providers);
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Failed to fetch providers" },
      { status: 500 },
    );
  }
}
