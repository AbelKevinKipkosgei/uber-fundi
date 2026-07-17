import { prisma } from "@/lib/prisma";
import { pusherServer } from "@/lib/pusherServer";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await req.formData();
  const socketId = formData.get("socket_id") as string;
  const channelName = formData.get("channel_name") as string;

  if (!socketId || !channelName) {
    return NextResponse.json(
      { error: "Missing socket_id or channel_name" },
      { status: 400 },
    );
  }

  // channelName looks like: private-conversation-<id>
  const conversationId = channelName.replace("private-conversation-", "");

  const conversation = await prisma.conversation.findUnique({
    where: { id: conversationId },
  });

  const isParticipant =
    conversation &&
    (conversation.participantAId === userId ||
      conversation.participantBId === userId);

  if (!isParticipant) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const authResponse = pusherServer.authorizeChannel(socketId, channelName);
  return NextResponse.json(authResponse);
}
