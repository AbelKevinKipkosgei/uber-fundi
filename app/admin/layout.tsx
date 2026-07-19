import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId, sessionClaims } = await auth();

  if (!userId) redirect("/sign-in");
  if (sessionClaims?.metadata?.role !== "admin") redirect("/");

  return children;
}
