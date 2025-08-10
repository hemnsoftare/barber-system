// app/layout.tsx
import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "../styles/globals.css";
import PageProvider from "./PageProvider"; // ✅ Client Component

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "FootBall Barber Club",
  description:
    "Get a sharp haircut, beard trim, or facial in birmingham. Book your appointment online.",
  keywords: ["barber", "haircut", "Birmingham", "beard trim", "barber near me"],
  openGraph: {
    title: "Barber in Birmingham | footballbarberclub.com",
    description: "Modern barber club with skilled stylists. Book now.",
    url: "https://www.footballbarberclub.com/",
    siteName: "footballbarberclub.com",
    images: [
      {
        url: "/images/logo.png",
        width: 1200,
        height: 630,
        alt: "Barber club in birmingham",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Barber in birmingham | footballbarberclub.com",
    description: "Get the best cut in town.",
    images: ["https://barber.com/images/og-cover.jpg"],
  },
  themeColor: "#1E1E1E", // ✅ This sets the browser header color
  robots: { index: true, follow: true }, // remove any index:false/noindex
};
export const viewport: Viewport = {
  themeColor: "#1E1E1E",
  width: "device-width",
  initialScale: 1,
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className=" overflow-y-scroll hide-y-scrollbar">
      <head>
        <meta
          name="description"
          content="Professional haircuts, beard trims, and grooming services in Birmingham. Book online at footballbarberclub.com."
        />
        <meta
          name="keywords"
          content="barber, haircut, beard trim, Birmingham barber, men's grooming, football barber club"
        />
        <link rel="canonical" href="https://www.footballbarberclub.com/" />
        <meta name="robots" content="index, follow" />
      </head>

      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://www.footballbarberclub.com/",
            "@type": "FootBall Barber Club",
            name: "Barber.com",
            image: "/images/logo.png",
            address: {
              "@type": "PostalAddress",
              addressLocality: "Birmingham",
              addressRegion: "England",
              postalCode: "B1 1AA",
              addressCountry: "GB",
            },
            telephone: "+9647502267967",
            url: "https://www.footballbarberclub.com/",
            openingHours: "Mo-Sa 09:00-20:00",
            priceRange: "$$",
          }),
        }}
      />
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased overflow-y-scroll hide-y-scrollbar bg-white-bg relative`}
      >
        {/* ✅ wrap PageProvider INSIDE <body> */}

        <PageProvider>{children}</PageProvider>
      </body>
    </html>
  );
}
