import { auth, clerkClient } from "@clerk/nextjs/server";
import { isAdmin } from "@/lib/isAdmin";
import { NextResponse } from "next/server";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const { userId: actingAdminId } = await auth();

  if (id === actingAdminId) {
    return NextResponse.json(
      { error: "You can't ban yourself" },
      { status: 400 },
    );
  }

  try {
    const client = await clerkClient();
    const user = await client.users.getUser(id);

    const updated = user.banned
      ? await client.users.unbanUser(id)
      : await client.users.banUser(id);

    return NextResponse.json({ id: updated.id, banned: updated.banned });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to update ban status" },
      { status: 500 },
    );
  }
}
