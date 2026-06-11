import { sql } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";

export async function POST(req: Request) {
  const { userId } = await auth();

  if (!userId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();

  await sql`
    INSERT INTO providers (
      clerk_user_id,
      name,
      service,
      phone,
      latitude,
      longitude
    )
    VALUES (
      ${userId},
      ${body.name},
      ${body.service},
      ${body.phone},
      ${body.latitude},
      ${body.longitude}
    )
  `;

  return Response.json({
    success: true,
  });
}
