import { prisma } from "@/lib/prisma";
import { resolveParticipant } from "@/lib/resolveParticipant";
import { isAdmin } from "@/lib/isAdmin";
import { NextResponse } from "next/server";

const PAGE_SIZE = 15;

export async function GET(req: Request) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");
  const cursor = searchParams.get("cursor");

  try {
    const reports = await prisma.report.findMany({
      where: status ? { status } : {},
      orderBy: { createdAt: "desc" },
      take: PAGE_SIZE + 1,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    });

    const hasMore = reports.length > PAGE_SIZE;
    const page = hasMore ? reports.slice(0, PAGE_SIZE) : reports;

    const withUsers = await Promise.all(
      page.map(async (r) => ({
        ...r,
        reporter: await resolveParticipant(r.reporterId),
        reportedUser: await resolveParticipant(r.reportedUserId),
      })),
    );

    return NextResponse.json({
      reports: withUsers,
      nextCursor: hasMore ? page[page.length - 1].id : null,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to fetch reports" },
      { status: 500 },
    );
  }
}
