import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { parseBody } from "@/lib/validate";
import { createReportSchema } from "@/lib/schemas";

const VALID_REASONS = [
  "SPAM",
  "SCAM_OR_FRAUD",
  "INAPPROPRIATE_BEHAVIOR",
  "FAKE_PROFILE",
  "OTHER",
];

export async function POST(req: Request) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const parsed = await parseBody(req, createReportSchema);
  if ("error" in parsed) return parsed.error;
  const { providerId, conversationId, reason, details } = parsed.data;

  if (!providerId && !conversationId) {
    return NextResponse.json(
      { error: "Must specify who you're reporting" },
      { status: 400 },
    );
  }

  try {
    let reportedUserId: string | null = null;

    if (providerId) {
      const provider = await prisma.provider.findUnique({
        where: { id: providerId },
        select: { clerkUserId: true },
      });
      reportedUserId = provider?.clerkUserId ?? null;
    } else if (conversationId) {
      const conversation = await prisma.conversation.findUnique({
        where: { id: conversationId },
      });

      if (!conversation) {
        return NextResponse.json(
          { error: "Conversation not found" },
          { status: 404 },
        );
      }

      const isParticipant =
        conversation.participantAId === userId ||
        conversation.participantBId === userId;

      if (!isParticipant) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }

      // Note: this correctly reports whichever side of the conversation ISN'T
      // the current user — since either participant could be a client or a
      // provider, this naturally supports reporting either type of account.
      reportedUserId =
        conversation.participantAId === userId
          ? conversation.participantBId
          : conversation.participantAId;
    }

    if (!reportedUserId) {
      return NextResponse.json(
        { error: "Could not identify who to report" },
        { status: 400 },
      );
    }

    if (reportedUserId === userId) {
      return NextResponse.json(
        { error: "You can't report yourself" },
        { status: 400 },
      );
    }

    await prisma.report.create({
      data: {
        reporterId: userId,
        reportedUserId,
        reason,
        details: details || null,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to submit report" },
      { status: 500 },
    );
  }
}
