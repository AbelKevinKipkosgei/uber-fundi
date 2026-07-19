import { prisma } from "@/lib/prisma";
import { isAdmin } from "@/lib/isAdmin";
import { NextResponse } from "next/server";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const providerId = parseInt(id, 10);

  try {
    const provider = await prisma.provider.findUnique({
      where: { id: providerId },
    });

    if (!provider) {
      return NextResponse.json(
        { error: "Provider not found" },
        { status: 404 },
      );
    }

    const updated = await prisma.provider.update({
      where: { id: providerId },
      data: { suspended: !provider.suspended },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to update provider" },
      { status: 500 },
    );
  }
}
