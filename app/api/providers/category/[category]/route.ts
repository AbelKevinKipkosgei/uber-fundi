import { sql } from "@/lib/db";
import { NextResponse } from "next/server";

const categoryMap: Record<string, string> = {
  plumbers: "Plumber",
  electricians: "Electrician",
  cleaners: "Cleaner",
  carpenters: "Carpenter",
  mechanics: "Mechanic",
  painters: "Painter",
};

export async function GET(
  req: Request,
  { params }: { params: Promise<{ category: string }> },
) {
  try {
    const { category } = await params;

    const service = categoryMap[category];

    if (!service) {
      return NextResponse.json(
        { error: "Category not found" },
        { status: 404 },
      );
    }

    const providers = await sql`
      SELECT *
      FROM providers
      WHERE service = ${service}
      ORDER BY rating DESC, created_at DESC
    `;

    return NextResponse.json(providers);
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Failed to fetch providers" },
      { status: 500 },
    );
  }
}
