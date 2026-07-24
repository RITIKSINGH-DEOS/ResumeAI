import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

/** App areas that need a signed-in user (not the marketing pages below). */
const isProtectedRoute = createRouteMatcher([
  "/dashboard(.*)",
  "/editor(.*)",
  "/builder(.*)",
  "/resume-analyzing(.*)",
  "/resume-ats(.*)",
]);

/** Can browse without an account (home, features, pricing, docs). */
const isPublicRoute = createRouteMatcher([
  "/sign-up(.*)",
  "/pricing(.*)",
  "/features(.*)",
  "/docs(.*)",
]);

export default clerkMiddleware(async (auth, req) => {
  const { userId } = await auth();
  const pathname = req.nextUrl.pathname;

  // Let API routes handle their own auth (JSON errors, not HTML redirects).
  if (pathname.startsWith("/api")) {
    return NextResponse.next();
  }

  // Marketing / auth pages
  if (isPublicRoute(req)) {
    if (userId && pathname.startsWith("/sign-up")) {
      return NextResponse.redirect(new URL("/", req.url));
    }
    return NextResponse.next();
  }

  if (isProtectedRoute(req) && !userId) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
