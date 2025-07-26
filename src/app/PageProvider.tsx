// components/providers/PageProvider.tsx
"use client";

import Footer from "@/components/layout/Foooter";
import Header from "@/components/layout/Header";
import { Toaster } from "@/components/ui/sonner";
import { useHideHeader } from "@/hook/usehideHeader";
import { ClerkProvider } from "@clerk/nextjs";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactNode } from "react";
export const queryClient = new QueryClient();
export default function PageProvider({ children }: { children: ReactNode }) {
  const hide = useHideHeader();
  return (
    <ClerkProvider
      publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}
    >
      <QueryClientProvider client={queryClient}>
        <div
          className={`${
            !hide ? `lg:px-24 md:px-8 px-4` : ""
          } overflow-y-scroll  hide-y-scrollbar`}
        >
          <Header />
          {children}
          <Toaster />
          <Footer />
        </div>
      </QueryClientProvider>
    </ClerkProvider>
  );
}
