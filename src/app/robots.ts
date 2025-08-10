import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const prod = process.env.VERCEL_ENV === "production";
  return {
    rules: prod
      ? [{ userAgent: "*", allow: "/" }]
      : [{ userAgent: "*", disallow: "/" }],
    sitemap: prod
      ? `${process.env.NEXT_PUBLIC_BASE_URL}/sitemap.xml`
      : undefined,
  };
}
