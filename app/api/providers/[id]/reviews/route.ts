import { prisma } from "@/lib/prisma";
import { resolveParticipant } from "@/lib/resolveParticipant";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const providerId = parseInt(id, 10);

  if (Number.isNaN(providerId)) {
    return NextResponse.json({ error: "Invalid provider id" }, { status: 400 });
  }

  try {
    const reviews = await prisma.review.findMany({
      where: { providerId },
      orderBy: { createdAt: "desc" },
    });

    const withReviewers = await Promise.all(
      reviews.map(async (r) => ({
        ...r,
        reviewer: await resolveParticipant(r.reviewerId),
      })),
    );

    return NextResponse.json(withReviewers);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to fetch reviews" },
      { status: 500 },
    );
  }
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const providerId = parseInt(id, 10);

  if (Number.isNaN(providerId)) {
    return NextResponse.json({ error: "Invalid provider id" }, { status: 400 });
  }

  const body = await req.json();
  const { rating, comment } = body;

  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    return NextResponse.json(
      { error: "Rating must be a whole number between 1 and 5" },
      { status: 400 },
    );
  }

  try {
    const provider = await prisma.provider.findUnique({
      where: { id: providerId },
    });

    if (!provider) {
      return NextResponse.json(
        { error: "Provider not found" },
        { status: 404 },
      );
    }

    if (provider.clerkUserId === userId) {
      return NextResponse.json(
        { error: "You can't review your own profile" },
        { status: 400 },
      );
    }

    await prisma.review.upsert({
      where: { providerId_reviewerId: { providerId, reviewerId: userId } },
      update: { rating, comment: comment || null },
      create: {
        providerId,
        reviewerId: userId,
        rating,
        comment: comment || null,
      },
    });

    const aggregate = await prisma.review.aggregate({
      where: { providerId },
      _avg: { rating: true },
    });

    const updatedProvider = await prisma.provider.update({
      where: { id: providerId },
      data: { rating: aggregate._avg.rating ?? 0 },
    });

    await prisma.notification.create({
      data: {
        userId: provider.clerkUserId,
        type: "NEW_RATING",
        title: "New rating",
        body: `${rating}★${comment ? ` — "${comment.slice(0, 60)}"` : ""}`,
        link: `/provider/${providerId}`,
      },
    });

    return NextResponse.json({ success: true, rating: updatedProvider.rating });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to submit review" },
      { status: 500 },
    );
  }
}
