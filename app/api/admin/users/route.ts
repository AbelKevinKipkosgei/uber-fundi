import { clerkClient } from "@clerk/nextjs/server";
import { isAdmin } from "@/lib/isAdmin";
import { NextResponse } from "next/server";

const PAGE_SIZE = 20;

export async function GET(req: Request) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const query = searchParams.get("query") ?? undefined;
  const offset = parseInt(searchParams.get("offset") ?? "0", 10);

  try {
    const client = await clerkClient();
    const { data, totalCount } = await client.users.getUserList({
      query,
      limit: PAGE_SIZE,
      offset,
      orderBy: "-created_at",
    });

    const users = data.map((u) => ({
      id: u.id,
      name:
        [u.firstName, u.lastName].filter(Boolean).join(" ") ||
        u.username ||
        "Unnamed",
      email: u.emailAddresses[0]?.emailAddress ?? null,
      imageUrl: u.imageUrl,
      banned: u.banned,
      createdAt: u.createdAt,
    }));

    return NextResponse.json({
      users,
      nextOffset: offset + PAGE_SIZE < totalCount ? offset + PAGE_SIZE : null,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to fetch users" },
      { status: 500 },
    );
  }
}
