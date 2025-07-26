/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [
      "img.clerk.com", // For Clerk user avatars
      "res.cloudinary.com", // For Cloudinary image assets
    ],
  },
  // You can add more config options here later, like experimental features, redirects, etc.
};

export default nextConfig;
