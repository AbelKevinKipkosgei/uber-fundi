import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function GET() {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const myProvider = await prisma.provider.findUnique({
      where: { clerkUserId: userId },
    });

    const [unseenAsClient, unseenAsProvider] = await Promise.all([
      prisma.booking.count({ where: { clientId: userId, clientSeen: false } }),
      myProvider
        ? prisma.booking.count({
            where: { providerId: myProvider.id, providerSeen: false },
          })
        : Promise.resolve(0),
    ]);

    return NextResponse.json({ count: unseenAsClient + unseenAsProvider });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to fetch unread count" },
      { status: 500 },
    );
  }
}
