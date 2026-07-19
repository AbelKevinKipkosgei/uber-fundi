import { auth } from "@clerk/nextjs/server";

export async function isAdmin() {
  const { sessionClaims } = await auth();
  return sessionClaims?.metadata?.role === "admin";
}
