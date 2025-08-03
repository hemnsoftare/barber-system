// app/layout.tsx
import type { Metadata } from "next";
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
  description: "Professional barbershop services and appointments",
  themeColor: "#480024", // ✅ This sets the browser header color
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className=" overflow-y-scroll hide-y-scrollbar">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased overflow-y-scroll hide-y-scrollbar bg-white-bg relative`}
      >
        {/* ✅ wrap PageProvider INSIDE <body> */}

        <PageProvider>{children}</PageProvider>
      </body>
    </html>
  );
}
