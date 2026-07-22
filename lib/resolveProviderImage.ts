import { clerkClient } from "@clerk/nextjs/server";

/**
 * Resolves the image a provider should end up with: their own upload if
 * provided, otherwise their current Clerk profile photo. Centralizing this
 * means the database itself rarely ends up with a genuinely null imageUrl,
 * so every reader (raw SQL, Prisma includes, resolveParticipant) stays
 * consistent without each needing its own fallback logic.
 */
export async function resolveProviderImage(
  clerkUserId: string,
  uploadedUrl: string | null | undefined,
): Promise<string | null> {
  if (uploadedUrl) return uploadedUrl;

  try {
    const client = await clerkClient();
    const clerkUser = await client.users.getUser(clerkUserId);
    return clerkUser.imageUrl || null;
  } catch (err) {
    console.error(`Failed to fetch Clerk image for ${clerkUserId}`, err);
    return null;
  }
}
