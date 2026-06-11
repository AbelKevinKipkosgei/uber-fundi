import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// Public routes (UI pages)
const isPublicRoute = createRouteMatcher([
  "/",
  "/providers(.*)",
  "/provider(.*)",
  "/sign-in(.*)",
  "/sign-up(.*)",
]);

// Public API routes (IMPORTANT)
const isPublicApiRoute = createRouteMatcher([
  "/api/providers(.*)", // 👈 THIS FIXES YOUR BUG
]);

export default clerkMiddleware(async (auth, request) => {
  // allow public pages
  if (isPublicRoute(request) || isPublicApiRoute(request)) {
    return;
  }

  // protect everything else
  await auth.protect();
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
