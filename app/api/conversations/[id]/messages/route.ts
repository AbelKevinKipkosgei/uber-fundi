// import { prisma } from "@/lib/prisma";
// import { auth } from "@clerk/nextjs/server";
// import { NextResponse } from "next/server";

// async function assertParticipant(conversationId: string, userId: string) {
//   const conversation = await prisma.conversation.findUnique({
//     where: { id: conversationId },
//   });

//   if (!conversation) return { conversation: null, authorized: false };

//   const authorized =
//     conversation.participantAId === userId ||
//     conversation.participantBId === userId;

//   return { conversation, authorized };
// }

// export async function GET(
//   req: Request,
//   { params }: { params: Promise<{ id: string }> },
// ) {
//   const { userId } = await auth();

//   if (!userId) {
//     return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
//   }

//   const { id } = await params;

//   try {
//     const { conversation, authorized } = await assertParticipant(id, userId);

//     if (!conversation) {
//       return NextResponse.json(
//         { error: "Conversation not found" },
//         { status: 404 },
//       );
//     }

//     if (!authorized) {
//       return NextResponse.json({ error: "Forbidden" }, { status: 403 });
//     }

//     const messages = await prisma.message.findMany({
//       where: { conversationId: id },
//       orderBy: { createdAt: "asc" },
//     });

//     return NextResponse.json(messages);
//   } catch (error) {
//     console.error(error);
//     return NextResponse.json(
//       { error: "Failed to fetch messages" },
//       { status: 500 },
//     );
//   }
// }

// export async function POST(
//   req: Request,
//   { params }: { params: Promise<{ id: string }> },
// ) {
//   const { userId } = await auth();

//   if (!userId) {
//     return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
//   }

//   const { id } = await params;
//   const body = await req.json();
//   const { text } = body;

//   if (!text || typeof text !== "string" || !text.trim()) {
//     return NextResponse.json(
//       { error: "Message cannot be empty" },
//       { status: 400 },
//     );
//   }

//   try {
//     const { conversation, authorized } = await assertParticipant(id, userId);

//     if (!conversation) {
//       return NextResponse.json(
//         { error: "Conversation not found" },
//         { status: 404 },
//       );
//     }

//     if (!authorized) {
//       return NextResponse.json({ error: "Forbidden" }, { status: 403 });
//     }

//     const [message] = await prisma.$transaction([
//       prisma.message.create({
//         data: {
//           conversationId: id,
//           senderId: userId,
//           body: text.trim(),
//         },
//       }),
//       prisma.conversation.update({
//         where: { id },
//         data: { lastMessageAt: new Date() },
//       }),
//     ]);

//     const recipientId =
//       conversation.participantAId === userId
//         ? conversation.participantBId
//         : conversation.participantAId;

//     await prisma.notification.create({
//       data: {
//         userId: recipientId,
//         type: "NEW_MESSAGE",
//         title: "New message",
//         body: text.trim().slice(0, 100),
//         link: `/messages/${id}`,
//       },
//     });

//     return NextResponse.json({ success: true, message });
//   } catch (error) {
//     console.error(error);
//     return NextResponse.json(
//       { error: "Failed to send message" },
//       { status: 500 },
//     );
//   }
// }

import { prisma } from "@/lib/prisma";
import { pusherServer } from "@/lib/pusherServer";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

async function assertParticipant(conversationId: string, userId: string) {
  const conversation = await prisma.conversation.findUnique({
    where: { id: conversationId },
  });

  if (!conversation) return { conversation: null, authorized: false };

  const authorized =
    conversation.participantAId === userId ||
    conversation.participantBId === userId;

  return { conversation, authorized };
}

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
    const { conversation, authorized } = await assertParticipant(id, userId);

    if (!conversation) {
      return NextResponse.json(
        { error: "Conversation not found" },
        { status: 404 },
      );
    }

    if (!authorized) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const messages = await prisma.message.findMany({
      where: { conversationId: id },
      orderBy: { createdAt: "asc" },
    });

    // Mark any messages from the OTHER participant as read, since this user
    // is actively viewing the conversation right now.
    const unreadFromOther = messages.filter(
      (m) => m.senderId !== userId && !m.readAt,
    );

    if (unreadFromOther.length > 0) {
      const now = new Date();

      await prisma.message.updateMany({
        where: { id: { in: unreadFromOther.map((m) => m.id) } },
        data: { readAt: now },
      });

      // Tell the sender's open thread (if any) that their messages were just seen
      await pusherServer.trigger(
        `private-conversation-${id}`,
        "messages-read",
        {
          readerId: userId,
          messageIds: unreadFromOther.map((m) => m.id),
          readAt: now.toISOString(),
        },
      );

      // Reflect the update in what we return too
      unreadFromOther.forEach((m) => {
        m.readAt = now;
      });
    }

    return NextResponse.json(messages);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to fetch messages" },
      { status: 500 },
    );
  }
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await req.json();
  const { text } = body;

  if (!text || typeof text !== "string" || !text.trim()) {
    return NextResponse.json(
      { error: "Message cannot be empty" },
      { status: 400 },
    );
  }

  try {
    const { conversation, authorized } = await assertParticipant(id, userId);

    if (!conversation) {
      return NextResponse.json(
        { error: "Conversation not found" },
        { status: 404 },
      );
    }

    if (!authorized) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const [message] = await prisma.$transaction([
      prisma.message.create({
        data: {
          conversationId: id,
          senderId: userId,
          body: text.trim(),
        },
      }),
      prisma.conversation.update({
        where: { id },
        data: { lastMessageAt: new Date() },
      }),
    ]);

    // Push the new message to anyone subscribed to this conversation's channel in real time
    await pusherServer.trigger(
      `private-conversation-${id}`,
      "new-message",
      message,
    );

    return NextResponse.json({ success: true, message });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to send message" },
      { status: 500 },
    );
  }
}
