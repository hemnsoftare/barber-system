"use client";

import { toast } from "sonner";

// UK rough bounding box (includes England, Wales, Scotland, NI)
const UK_BOUNDS = {
  minLat: 49.84, // south (Isles of Scilly)
  maxLat: 60.86, // north (Shetland)
  minLon: -8.65, // west (NI)
  maxLon: 1.77, // east (Norfolk)
};

export async function checkInUK(): Promise<boolean> {
  if (typeof window === "undefined") {
    return false; // SSR safe
  }

  if (!("geolocation" in navigator)) {
    toast.error("Location not supported on this device.");
    return false;
  }

  try {
    const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject, {
        enableHighAccuracy: true,
        timeout: 8000,
        maximumAge: 0,
      });
    });

    const lat = pos.coords.latitude;
    const lon = pos.coords.longitude;

    const inUK =
      lat >= UK_BOUNDS.minLat &&
      lat <= UK_BOUNDS.maxLat &&
      lon >= UK_BOUNDS.minLon &&
      lon <= UK_BOUNDS.maxLon;

    return inUK;
  } catch (err: unknown) {
    const e = err as { code?: number; message?: string };
    if (e.code === 1) {
      toast.error("Location permission denied. Can’t book without it.");
    } else if (e.code === 3) {
      toast.error("Location timed out. Try again.");
    } else {
      toast.error(e.message || "Couldn’t get your location.");
    }
    return false;
  }
}
