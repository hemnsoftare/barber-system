// app/dashboard/layout.tsx

import DashboardLayout from "@/feature-modules/dashboard/layout";
import { Viewport } from "next";
import type { ReactNode } from "react";
export const viewport: Viewport = {
  themeColor: "#1E1E1E",
  width: "device-width",
  initialScale: 1,
};
export default function Layout({ children }: { children: ReactNode }) {
  return <DashboardLayout>{children}</DashboardLayout>;
}
