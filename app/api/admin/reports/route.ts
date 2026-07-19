import { prisma } from "@/lib/prisma";
import { resolveParticipant } from "@/lib/resolveParticipant";
import { isAdmin } from "@/lib/isAdmin";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");

  try {
    const reports = await prisma.report.findMany({
      where: status ? { status } : {},
      orderBy: { createdAt: "desc" },
    });

    const withUsers = await Promise.all(
      reports.map(async (r) => ({
        ...r,
        reporter: await resolveParticipant(r.reporterId),
        reportedUser: await resolveParticipant(r.reportedUserId),
      })),
    );

    return NextResponse.json(withUsers);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to fetch reports" },
      { status: 500 },
    );
  }
}
