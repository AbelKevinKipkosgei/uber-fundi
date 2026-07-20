import { NextResponse } from "next/server";
import { z } from "zod";

export async function parseBody<T extends z.ZodTypeAny>(
  req: Request,
  schema: T,
): Promise<{ data: z.infer<T> } | { error: NextResponse }> {
  let json: unknown;

  try {
    json = await req.json();
  } catch {
    return {
      error: NextResponse.json({ error: "Invalid JSON body" }, { status: 400 }),
    };
  }

  const result = schema.safeParse(json);

  if (!result.success) {
    const firstIssue = result.error.issues[0];
    return {
      error: NextResponse.json(
        { error: firstIssue?.message ?? "Invalid request" },
        { status: 400 },
      ),
    };
  }

  return { data: result.data };
}
