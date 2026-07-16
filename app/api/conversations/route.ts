import { prisma } from "@/lib/prisma";
import { resolveParticipant } from "@/lib/resolveParticipant";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function GET() {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const conversations = await prisma.conversation.findMany({
      where: {
        OR: [{ participantAId: userId }, { participantBId: userId }],
      },
      orderBy: { lastMessageAt: "desc" },
      include: {
        messages: {
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
    });

    const withParticipants = await Promise.all(
      conversations.map(async (conv) => {
        const otherUserId =
          conv.participantAId === userId
            ? conv.participantBId
            : conv.participantAId;
        const other = await resolveParticipant(otherUserId);

        return {
          id: conv.id,
          otherParticipant: other,
          lastMessage: conv.messages[0] ?? null,
          lastMessageAt: conv.lastMessageAt,
        };
      }),
    );

    return NextResponse.json(withParticipants);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to fetch conversations" },
      { status: 500 },
    );
  }
}

export async function POST(req: Request) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { providerId } = body;

  if (!providerId) {
    return NextResponse.json({ error: "Missing providerId" }, { status: 400 });
  }

  try {
    const provider = await prisma.provider.findUnique({
      where: { id: providerId },
      select: { clerkUserId: true },
    });

    if (!provider) {
      return NextResponse.json(
        { error: "Provider not found" },
        { status: 404 },
      );
    }

    if (provider.clerkUserId === userId) {
      return NextResponse.json(
        { error: "You can't message yourself" },
        { status: 400 },
      );
    }

    let conversation = await prisma.conversation.findFirst({
      where: {
        OR: [
          { participantAId: userId, participantBId: provider.clerkUserId },
          { participantAId: provider.clerkUserId, participantBId: userId },
        ],
      },
    });

    if (!conversation) {
      conversation = await prisma.conversation.create({
        data: {
          participantAId: userId,
          participantBId: provider.clerkUserId,
        },
      });
    }

    return NextResponse.json({ conversationId: conversation.id });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to start conversation" },
      { status: 500 },
    );
  }
}
