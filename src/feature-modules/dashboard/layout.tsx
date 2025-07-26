// app/dashboard/layout.tsx (or wherever your layout is)

"use client";

import { sidebarItems } from "@/constants";
import { Icon } from "@/constants/icons";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { CiMenuFries } from "react-icons/ci";
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathName = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex flex-col sm:flex-row h-screen bg-[#F3F3F3] text-white">
      {/* Sidebar */}
      <header>
        <div className="flex items-center sm:hidden border-b justify-between px-4 py-2 w-full ">
          <button onClick={() => setSidebarOpen((prev) => !prev)}>
            <CiMenuFries className="md:hidden mr-3" color="black" size={29} />
          </button>

          <Image
            src="/images/logo-no-background.png"
            alt="Logo"
            width={22}
            height={29}
            className=" self-start min-h-[45px] min-w-[42px]"
          />
          <h1 className="text-2xl self-center w-full text-center text-black font-bold">
            Dashboard
          </h1>
        </div>
      </header>
      <aside
        className={`bg-dark-purple lg:w-[230px] w-44 sm:flex flex-col overflow-y-auto  items-center py-8 space-y-6
    fixed sm:static top-0 left-0 h-full z-50 transition-transform duration-300
    ${
      sidebarOpen ? "translate-x-0" : "-translate-x-full"
    } sm:translate-x-0 px-4 lg:px-8`}
      >
        {sidebarOpen && (
          <button
            className="absolute top-4 right-4 text-white z-50"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close sidebar"
          >
            <svg width="28" height="28" viewBox="0 0 20 20" fill="none">
              <line
                x1="5"
                y1="5"
                x2="15"
                y2="15"
                stroke="white"
                strokeWidth="2"
              />
              <line
                x1="15"
                y1="5"
                x2="5"
                y2="15"
                stroke="white"
                strokeWidth="2"
              />
            </svg>
          </button>
        )}
        <Image
          src="/images/logo-no-background.png"
          alt="Logo"
          width={80}
          height={80}
          className="mb-6 self-start min-h-[79px] min-w-[52px]"
        />
        <nav className="w-full space-y-2">
          {sidebarItems.map((item) => {
            const isActive =
              (item.path === "/" && pathName === "/dashboard") ||
              (item.path !== "/" &&
                pathName.startsWith("/dashboard" + item.path));

            return (
              <Link
                key={item.label}
                href={"/dashboard" + item.path}
                className={`flex items-center text-sm px-3 rounded-md gap-3 box-border py-3 hover:bg-[#63003d] duration-300 transition ${
                  isActive ? "bg-white text-dark-purple" : "text-white"
                }`}
              >
                <Icon
                  name={item.icon}
                  color={isActive ? "#480024" : "#ffffff"}
                  // className={`${isActive ? "text-dark-purple" : "text-white"}`}
                />
                <span
                  className={`${isActive ? "text-dark-purple" : "text-white"}`}
                >
                  {item.label}
                </span>
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 sm:p-4 lg:p-10 px-4 py-12 lg:py-24 overflow-auto text-black ">
        {children}
      </main>
    </div>
  );
}
