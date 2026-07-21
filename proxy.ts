import { clerkMiddleware } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { generalRatelimit, paymentRatelimit } from "@/lib/ratelimit";

export default clerkMiddleware(async (auth, req) => {
  const { pathname } = req.nextUrl;

  if (pathname.startsWith("/api")) {
    const { userId } = await auth();

    // Prefer a stable per-user identity when signed in; fall back to IP
    // for anonymous requests (browsing categories, viewing posts, etc.)
    const identifier =
      userId ?? req.headers.get("x-forwarded-for") ?? "anonymous";

    const limiter = pathname.startsWith("/api/payments/stk-push")
      ? paymentRatelimit
      : generalRatelimit;

    const { success, limit, remaining, reset } =
      await limiter.limit(identifier);

    if (!success) {
      return NextResponse.json(
        { error: "Too many requests. Please slow down and try again shortly." },
        {
          status: 429,
          headers: {
            "X-RateLimit-Limit": limit.toString(),
            "X-RateLimit-Remaining": remaining.toString(),
            "X-RateLimit-Reset": reset.toString(),
          },
        },
      );
    }
  }
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
