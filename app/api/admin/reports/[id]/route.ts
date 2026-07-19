import { prisma } from "@/lib/prisma";
import { isAdmin } from "@/lib/isAdmin";
import { NextResponse } from "next/server";

const VALID_STATUSES = ["PENDING", "RESOLVED", "DISMISSED"];

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const body = await req.json();
  const { status } = body;

  if (!VALID_STATUSES.includes(status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  try {
    const report = await prisma.report.update({
      where: { id },
      data: { status },
    });
    return NextResponse.json(report);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to update report" },
      { status: 500 },
    );
  }
}
