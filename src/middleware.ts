import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isDashboard = createRouteMatcher(["/dashboard(.*)"]);
const isBarberOnly = createRouteMatcher(["/news(.*)"]);

export default clerkMiddleware(async (auth, req) => {
  const { sessionClaims } = await auth();

  const userRole = sessionClaims?.metadata?.role;

  // 👮 Admin-only routes - redirect if NOT admin
  if (isDashboard(req) && userRole !== "admin" && userRole !== "barber") {
    const url = new URL("/unauthorized", req.url);
    return NextResponse.redirect(url);
  }

  // 💈 Barber-only routes - redirect if NOT barber
  if (isBarberOnly(req) && userRole !== "barber") {
    const url = new URL("/unauthorized", req.url);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    // Protect all routes except static assets
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
