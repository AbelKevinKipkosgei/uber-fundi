import { prisma } from "@/lib/prisma";
import { clerkClient } from "@clerk/nextjs/server";

export type ParticipantDisplay = {
  clerkUserId: string;
  name: string;
  imageUrl: string | null;
};

export async function resolveParticipant(
  targetClerkUserId: string,
): Promise<ParticipantDisplay> {
  const provider = await prisma.provider.findUnique({
    where: { clerkUserId: targetClerkUserId },
    select: { name: true, imageUrl: true },
  });

  if (provider) {
    let providerImageUrl = provider.imageUrl;

    // Safety net for providers created before Clerk-photo syncing existed
    if (!providerImageUrl) {
      try {
        const client = await clerkClient();
        const clerkUser = await client.users.getUser(targetClerkUserId);
        providerImageUrl = clerkUser.imageUrl || null;
      } catch (err) {
        console.error(
          `Failed to fetch fallback Clerk image for ${targetClerkUserId}`,
          err,
        );
      }
    }

    return {
      clerkUserId: targetClerkUserId,
      name: provider.name,
      imageUrl: providerImageUrl,
    };
  }

  try {
    const client = await clerkClient();
    const user = await client.users.getUser(targetClerkUserId);
    const name =
      [user.firstName, user.lastName].filter(Boolean).join(" ") ||
      user.username ||
      "UberFundi User";

    return {
      clerkUserId: targetClerkUserId,
      name,
      imageUrl: user.imageUrl ?? null,
    };
  } catch (error) {
    console.error(`Failed to resolve Clerk user ${targetClerkUserId}`, error);
    return {
      clerkUserId: targetClerkUserId,
      name: "UberFundi User",
      imageUrl: null,
    };
  }
}
