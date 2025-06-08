// app/dashboard/layout.tsx (or wherever your layout is)

"use client";

import { sidebarItems } from "@/constants";
import { Icon } from "@/constants/icons";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathName = usePathname();
  return (
    <div className="flex h-screen bg-[#F3F3F3] text-white">
      {/* Sidebar */}
      <aside className="w-64 bg-dark-purple px-8 flex flex-col overflow-y-auto items-center py-8 space-y-6">
        <Image
          src="/images/logo-no-background.png"
          alt="Logo"
          width={80}
          height={80}
          className="mb-6 self-start min-h-[79px] min-w-[52px]"
        />
        <nav className="w-full space-y-2">
          {sidebarItems.map((item) => {
            const isActive = pathName.endsWith(item.path) && item.path !== "/";
            return (
              <Link
                key={item.label}
                href={"/dashboard" + item.path}
                className={`flex items-center text-shadow-neutral-50 text-shadow-2xs text-sm px-3 rounded-md gap-3 box-border py-3 hover:bg-[#63003d] duration-300 transition ${
                  isActive
                    ? "bg-[#ffffff] text-dark-purple hover:bg-white/85"
                    : ""
                }`}
              >
                <Icon name={item.icon} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-10 overflow-auto text-black bg-white">
        {children}
      </main>
    </div>
  );
}
