/** @type {import('next').NextConfig} */
const isProd = process.env.VERCEL_ENV === "production";

const nextConfig = {
  images: {
    domains: ["img.clerk.com", "res.cloudinary.com"],
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: isProd
          ? [{ key: "X-Robots-Tag", value: "index, follow" }]
          : [{ key: "X-Robots-Tag", value: "noindex, nofollow, noarchive" }],
      },
    ];
  },
};

export default nextConfig;
