"use client";
import { usePathname } from "next/navigation";

export function useHideHeader() {
  const pathname = usePathname();

  const visiblePaths = [
    "/", // keep this, but handle it separately
    "/about-us",
    "/appointments",
    "/barbers",
    "/blog",
    "/user-profile",
    "/booking",
    "/contact-us",
    "/favorites",
    "/gallery",
    "/news",
    "/notifications",
    "/services",
  ];

  const shouldHide = !visiblePaths.some((path) =>
    path === "/" ? pathname === "/" : pathname.startsWith(path)
  );

  return shouldHide;
}
