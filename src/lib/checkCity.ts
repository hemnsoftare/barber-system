// lib/checkCity.ts
"use client";

import { toast } from "sonner";

const BIRMINGHAM = { lat: 52.4862, lon: -1.8904 };
const RADIUS_KM = 35;

function haversineKm(
  a: { lat: number; lon: number },
  b: { lat: number; lon: number }
) {
  const toRad = (v: number) => (v * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(b.lat - a.lat);
  const dLon = toRad(b.lon - a.lon);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const x =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(x));
}

export async function checkInBirmingham(): Promise<boolean> {
  if (typeof window === "undefined") {
    // running on server, just say no
    return false;
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

    const here = { lat: pos.coords.latitude, lon: pos.coords.longitude };
    const km = haversineKm(here, BIRMINGHAM);
    return km <= RADIUS_KM;
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
