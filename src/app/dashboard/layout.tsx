// app/dashboard/layout.tsx

import DashboardLayout from "@/feature-modules/dashboard/layout";
import { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
export const viewport: Viewport = {
  themeColor: "#480024",
  width: "device-width",
  initialScale: 1,
};
export const metadata: Metadata = {
  themeColor: "#480024",
};
export default function Layout({ children }: { children: ReactNode }) {
  return <DashboardLayout>{children}</DashboardLayout>;
}
