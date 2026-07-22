import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

type NearbyRow = {
  id: number;
  name: string;
  phone: string;
  bio: string | null;
  image_url: string | null;
  rating: number | null;
  is_available: boolean | null;
  category_name: string;
  distance: number;
};

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const lat = parseFloat(searchParams.get("lat") ?? "");
  const lng = parseFloat(searchParams.get("lng") ?? "");
  const radiusKm = parseFloat(searchParams.get("radius") ?? "50");

  if (Number.isNaN(lat) || Number.isNaN(lng)) {
    return NextResponse.json(
      { error: "Missing or invalid lat/lng" },
      { status: 400 },
    );
  }

  try {
    const providers = await prisma.$queryRaw<NearbyRow[]>`
      SELECT * FROM (
        SELECT
          p.id,
          p.name,
          p.phone,
          p.bio,
          p.image_url,
          p.rating,
          p.is_available,
          c.name AS category_name,
          (
            6371 * acos(
              cos(radians(${lat})) * cos(radians(p.latitude)) *
              cos(radians(p.longitude) - radians(${lng})) +
              sin(radians(${lat})) * sin(radians(p.latitude))
            )
          ) AS distance
        FROM providers p
        JOIN categories c ON c.id = p.category_id
        WHERE p.is_available = true AND p.suspended = false
      ) sub
      WHERE distance <= ${radiusKm}
      ORDER BY distance ASC
      LIMIT 50
    `;

    const formatted = providers.map((p) => ({
      id: p.id,
      name: p.name,
      phone: p.phone,
      bio: p.bio,
      imageUrl: p.image_url,
      rating: p.rating,
      distance: p.distance,
      category: { name: p.category_name },
    }));

    return NextResponse.json(formatted);
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Failed to fetch nearby providers" },
      { status: 500 },
    );
  }
}
