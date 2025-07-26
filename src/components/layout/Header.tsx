"use client";

import Image from "next/image";
import Link from "next/link";
import React, { useState } from "react";
import { useUser } from "@clerk/nextjs";
import { useHideHeader } from "@/hook/usehideHeader";
import HeaderDropdown from "./HeaderDropdown";
import { IoClose } from "react-icons/io5"; // for close icon
import { SheetDemo } from "./Menu";
import { Icon } from "@/constants/icons";

const Header = () => {
  const { isSignedIn, isLoaded, user } = useUser();
  const role = user?.publicMetadata.role as "barber" | "admin";
  const hide = useHideHeader();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  if (hide) return null;

  return (
    <>
      <div className="flex items-center md:py-7 py-4 w-full  justify-between">
        {/* Logo and Menu Button */}
        <div className="flex items-center justify-center gap-4">
          <SheetDemo role={role} />
          <Image
            src={"/images/logo-no-background.png"}
            alt="logo"
            width={51}
            height={58}
            className="md:w-[51px] w-8 h-9 md:h-[58px]"
          />
        </div>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center text-lg text-white justify-center md:gap-7 lg:gap-14">
          {[
            { text: "Home", path: "/" },
            { text: "Booking", path: "/booking/services" },
            { text: "Gallery", path: "/gallery" },
            { text: "Services", path: "/services" },
            { text: "Contact us", path: "/contact-us" },
            { text: "About", path: "/about-us" },
            ...(role === "admin"
              ? [{ text: "Dashboard", path: "/dashboard" }]
              : []),
          ].map(({ text, path }, i) => (
            <Link
              key={i}
              href={path}
              className="md:hover:text-gray-400 duration-200 transition-all focus:scale-90"
            >
              {text}
            </Link>
          ))}
        </div>
        {/* Right - Auth */}
        <div className="flex w-[200px] md:w-fit  lg:w-[130px] justify-end items-center gap-3">
          {!isLoaded ? (
            <Icon
              name="user"
              className="w-6 h-6 text-white border rounded-full px-1 py-1 box-content"
              style={{
                animation: "opacityPulse 1s infinite",
              }}
            />
          ) : isSignedIn ? (
            <HeaderDropdown
              role={role}
              fullName={user?.fullName || "Guest User"}
              profileImage={user.imageUrl}
            />
          ) : (
            <>
              <Link
                href={"/sign-in"}
                className="text-white border box-border w-fit md:px-2 lg:px-4  px-4 py-1 rounded-[2px] duration-200 transition-all focus:scale-90 md:hover:bg-dark-purple"
              >
                Log In
              </Link>
              <Link
                href={"/sign-up"}
                className="text-white border box-content  w-fit md:px-2 lg:px-4 px-4 py-1 rounded-[2px] duration-200 transition-all focus:scale-90 md:hover:bg-dark-purple"
              >
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>

      {/* 🧱 Mobile Sidebar */}
      {isSidebarOpen && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-90 flex flex-col gap-6 items-center justify-center text-white text-2xl transition-all">
          <button
            className="absolute top-5 right-5 text-white"
            onClick={() => setIsSidebarOpen(false)}
          >
            <IoClose size={36} />
          </button>
          {[
            "Home",
            "booking/services",
            "about-us",
            "contact-us",
            "services",
            "gallery",
          ].map((href, i) => (
            <Link
              key={i}
              href={`/${href}`}
              onClick={() => setIsSidebarOpen(false)}
              className="hover:text-gray-400 duration-200"
            >
              {href.replace("-", " ").replace("/", "").toUpperCase()}
            </Link>
          ))}
        </div>
      )}
    </>
  );
};

export default Header;
