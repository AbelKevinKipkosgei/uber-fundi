import { prisma } from "@/lib/prisma";
import { resolveParticipant } from "@/lib/resolveParticipant";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  try {
    const conversation = await prisma.conversation.findUnique({
      where: { id },
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

    const otherUserId =
      conversation.participantAId === userId
        ? conversation.participantBId
        : conversation.participantAId;

    const [otherParticipant, otherAsProvider] = await Promise.all([
      resolveParticipant(otherUserId),
      prisma.provider.findUnique({
        where: { clerkUserId: otherUserId },
        select: { id: true },
      }),
    ]);

    return NextResponse.json({
      id: conversation.id,
      otherParticipant: {
        ...otherParticipant,
        providerId: otherAsProvider?.id ?? null,
      },
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to fetch conversation" },
      { status: 500 },
    );
  }
}
