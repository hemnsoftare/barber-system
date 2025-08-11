import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isDashboard = createRouteMatcher(["/dashboard(.*)"]);
const isBarberOnly = createRouteMatcher(["/news(.*)"]);
const isBooking = createRouteMatcher(["/booking(.*)"]); // 🔒 booking requires auth
const isBookingHistory = createRouteMatcher(["/appointments/history(.*)"]); // 🔒 booking requires auth
const isUserProfile = createRouteMatcher(["/user-profile"]); // 🔒 booking requires auth
const isNotifications = createRouteMatcher(["/notifications"]); // 🔒 booking requires auth
const isFavorite = createRouteMatcher(["/favorites/gallery"]); // 🔒 booking requires auth

export default clerkMiddleware(async (auth, req) => {
  const { sessionClaims, userId } = await auth();

  const userRole = sessionClaims?.metadata?.role;

  // 🚫 Block /booking for unauthenticated users
  if (
    (isBooking(req) ||
      isBookingHistory(req) ||
      isUserProfile(req) ||
      isNotifications(req) ||
      isFavorite(req)) &&
    !userId
  ) {
    const url = new URL("/", req.url);
    // send them back where they tried to go after sign-in
    url.searchParams.set(
      "redirect_url",
      req.nextUrl.pathname + req.nextUrl.search
    );
    return NextResponse.redirect(url);
  }
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
