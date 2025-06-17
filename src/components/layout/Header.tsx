"use client";

import Image from "next/image";
import Link from "next/link";
import React from "react";
import { useUser } from "@clerk/nextjs";
import { useHideHeader } from "@/hook/usehideHeader";
import HeaderDropdown from "./HeaderDropdown";

const Header = () => {
  const { isSignedIn, isLoaded, user } = useUser();
  const hide = useHideHeader();
  if (hide) return null;
  else
    return (
      <div className="flex items-center py-7 justify-between">
        {/* Logo */}
        <Image
          src={"/images/logo-no-background.png"}
          alt="logo"
          width={51}
          height={58}
          className="w-[51px] h-[58px]"
        />

        {/* Center Nav */}
        <div className="flex items-center text-lg text-white justify-center gap-14">
          <Link
            className="md:hover:text-gray-400 duration-200 transition-all focus:scale-90"
            href={"/about-us"}
          >
            About
          </Link>
          <Link
            className="md:hover:text-gray-400 duration-200 transition-all focus:scale-90"
            href={"/contact-us"}
          >
            Contact us
          </Link>
          <Link
            className="md:hover:text-gray-400 duration-200 transition-all focus:scale-90"
            href={"/services"}
          >
            Services
          </Link>
          <Link
            className="md:hover:text-gray-400 duration-200 transition-all focus:scale-90"
            href={"/gallery"}
          >
            Gallery
          </Link>
        </div>

        {/* Right - Auth */}
        <div className="flex w-[100px] items-center gap-4">
          {!isLoaded ? (
            <span className="text-white animate-pulse">Loading...</span>
          ) : isSignedIn ? (
            <HeaderDropdown
              fullName={user?.fullName || "Guest User"}
              profileImage={user.imageUrl}
            />
          ) : (
            <>
              <Link
                href={"/sign-in"}
                className="text-white border px-4 py-1 rounded-[2px] duration-200 transition-all focus:scale-90 md:hover:bg-dark-purple"
              >
                Log In
              </Link>
              <Link
                href={"/sign-up"}
                className="text-white border px-4 py-1 rounded-[2px] duration-200 transition-all focus:scale-90 md:hover:bg-dark-purple"
              >
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>
    );
};

export default Header;
