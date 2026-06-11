import { sql } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);

  const lat = parseFloat(searchParams.get("lat") || "0");
  const lng = parseFloat(searchParams.get("lng") || "0");

  const providers = await sql`
    SELECT *,
    (
      6371 * acos(
        cos(radians(${lat})) *
        cos(radians(latitude)) *
        cos(radians(longitude) - radians(${lng})) +
        sin(radians(${lat})) *
        sin(radians(latitude))
      )
    ) AS distance
    FROM providers
    ORDER BY distance ASC;
  `;

  return NextResponse.json(providers);
}
