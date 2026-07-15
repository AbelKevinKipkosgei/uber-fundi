import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const providerId = parseInt(id, 10);

    if (Number.isNaN(providerId)) {
      return NextResponse.json(
        { error: "Invalid provider id" },
        { status: 400 },
      );
    }

    const provider = await prisma.provider.findUnique({
      where: { id: providerId },
      include: {
        category: true,
        subcategories: { include: { category: true } },
      },
    });

    if (!provider) {
      return NextResponse.json(
        { error: "Provider not found" },
        { status: 404 },
      );
    }

    return NextResponse.json(provider);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to fetch provider" },
      { status: 500 },
    );
  }
}
