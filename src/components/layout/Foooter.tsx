"use client";

import { useHideHeader } from "@/hook/usehideHeader";
import Image from "next/image";
import Link from "next/link";
import React from "react";

const Footer = () => {
  const hide = useHideHeader();
  if (hide) return null;

  return (
    <footer className="bg-[#1E1E1E] text-white py-6 md:py-8 lg:py-12 px-4 sm:px-6 md:px-8 lg:px-24 -mx-4 sm:-mx-6 md:-mx-8 lg:-mx-24 mt-8 sm:mt-10 md:mt-12 overflow-x-hidden relative">
      {/* Content */}
      <div className="max-w-7xl mx-auto">
        {/* Main Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 sm:gap-8 md:gap-10 items-start z-10 relative">
          {/* Logo */}
          <div className="flex flex-col items-center sm:items-start lg:items-start col-span-1 sm:col-span-2 lg:col-span-1">
            <Image
              src="/images/logo.png"
              alt="Football Barber Club Logo"
              width={72}
              height={96}
              className="rounded-xl w-16 h-20 sm:w-[72px] sm:h-24 shadow-lg object-contain"
            />
          </div>

          {/* Links */}
          <div className="text-center sm:text-left">
            <h3 className="text-light-blue font-bold text-lg sm:text-xl mb-3 sm:mb-4">
              Links
            </h3>
            <ul className="space-y-2 text-gray-300 text-sm sm:text-base">
              <li>
                <Link
                  href="#services"
                  className="hover:text-blue-400 transition-colors duration-200 block py-1"
                >
                  Services
                </Link>
              </li>
              <li>
                <Link
                  href="#contact"
                  className="hover:text-blue-400 transition-colors duration-200 block py-1"
                >
                  Contact us
                </Link>
              </li>
              <li>
                <Link
                  href="#locations"
                  className="hover:text-blue-400 transition-colors duration-200 block py-1"
                >
                  Locations
                </Link>
              </li>
              <li>
                <Link
                  href="#cancellation"
                  className="hover:text-blue-400 transition-colors duration-200 block py-1"
                >
                  Cancellation policy
                </Link>
              </li>
            </ul>
          </div>

          {/* Socials */}
          <div className="text-center sm:text-left">
            <h3 className="text-light-blue font-bold text-lg sm:text-xl mb-3 sm:mb-4">
              Socials
            </h3>
            <ul className="space-y-2 text-gray-300 text-sm sm:text-base">
              <li>
                <Link
                  href="#"
                  className="hover:text-blue-400 transition-colors duration-200 block py-1"
                >
                  Facebook
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="hover:text-blue-400 transition-colors duration-200 block py-1"
                >
                  Instagram
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="hover:text-blue-400 transition-colors duration-200 block py-1"
                >
                  Twitter
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="hover:text-blue-400 transition-colors duration-200 block py-1"
                >
                  WhatsApp
                </Link>
              </li>
            </ul>
          </div>

          {/* Hours */}
          <div className="text-center sm:text-left">
            <h3 className="text-light-blue font-bold text-lg sm:text-xl mb-3 sm:mb-4">
              Opening hours
            </h3>
            <div className="text-sm sm:text-base text-gray-300 space-y-2">
              <p className="leading-relaxed">
                <span className="font-semibold text-white block sm:inline">
                  Mon to Sat:
                </span>
                <span className="block sm:inline sm:ml-1">09 AM - 07 PM</span>
              </p>
              <p className="leading-relaxed">
                <span className="font-semibold text-white block sm:inline">
                  Sun:
                </span>
                <span className="block sm:inline sm:ml-1">10 AM - 05 PM</span>
              </p>
            </div>
          </div>

          {/* Book button */}
          <div className="flex justify-center sm:justify-start lg:justify-end items-start col-span-1 sm:col-span-2 lg:col-span-1">
            <Link
              href="/booking"
              className="text-blue-400 border border-blue-400 font-semibold text-sm sm:text-base px-4 sm:px-6 py-2 sm:py-3 rounded-md hover:bg-blue-500 hover:text-white transition-all duration-200 whitespace-nowrap"
            >
              Book an appointment
            </Link>
          </div>
        </div>

        {/* Footer bottom */}
        <div className="text-center text-xs sm:text-sm bg-[#252525] text-gray-500 mt-8 sm:mt-10 md:mt-12 pt-4 sm:pt-6 border-t border-white/10 -mx-4 sm:-mx-6 md:-mx-8 lg:-mx-24 px-4 sm:px-6 md:px-8 lg:px-24">
          <p>© Football Barber Club 2025, all rights reserved</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
