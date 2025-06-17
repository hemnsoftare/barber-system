"use client";

import { useHideHeader } from "@/hook/usehideHeader";
import Image from "next/image";
import Link from "next/link";
import React from "react";

const Footer = () => {
  const hide = useHideHeader();
  if (hide) return null;
  return (
    <footer className="bg-[#1E1E1E] text-white py-4 -mx-24  px-24 mt-12 relative">
      {/* Content */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-10 items-start z-10 relative">
        {/* Logo */}
        <div className="flex flex-col items-center lg:items-start">
          <Image
            src="/images/logo.png"
            alt="Football Barber Club Logo"
            width={72}
            height={96}
            className="rounded-xl w-[72px] h-24 shadow-lg object-contain"
          />
        </div>

        {/* Links */}
        <div>
          <h3 className="text-light-blue font-bold text-xl  mb-4">Links</h3>
          <ul className="space-y-2 text-gray-300 text-sm">
            <li>
              <Link href="#services" className="hover:text-blue-400">
                Services
              </Link>
            </li>
            <li>
              <Link href="#contact" className="hover:text-blue-400">
                Contact us
              </Link>
            </li>
            <li>
              <Link href="#locations" className="hover:text-blue-400">
                Locations
              </Link>
            </li>
            <li>
              <Link href="#cancellation" className="hover:text-blue-400">
                Cancellation policy
              </Link>
            </li>
          </ul>
        </div>

        {/* Socials */}
        <div>
          <h3 className="text-light-blue font-bold text-xl  mb-4">Socials</h3>
          <ul className="space-y-2 text-gray-300 text-sm">
            <li>
              <Link href="#" className="hover:text-blue-400">
                Facebook
              </Link>
            </li>
            <li>
              <Link href="#" className="hover:text-blue-400">
                Instagram
              </Link>
            </li>
            <li>
              <Link href="#" className="hover:text-blue-400">
                Twitter
              </Link>
            </li>
            <li>
              <Link href="#" className="hover:text-blue-400">
                WhatsApp
              </Link>
            </li>
          </ul>
        </div>

        {/* Hours */}
        <div>
          <h3 className="text-light-blue font-bold text-xl  mb-4">
            Opening hours
          </h3>
          <div className="text-sm text-gray-300 space-y-2">
            <p>
              <span className="font-semibold text-white">Mon to Sat :</span> 09
              AM - 07 PM
            </p>
            <p>
              <span className="font-semibold text-white">Sun :</span> 10 AM - 05
              PM
            </p>
          </div>
        </div>

        {/* Book button */}
        <div className="flex justify-center lg:justify-end items-start">
          <Link
            href="/booking"
            className="text-blue-400 border border-blue-400 font-semibold text-sm px-4 py-2 rounded-md hover:bg-blue-500 hover:text-white transition"
          >
            Book an appointment
          </Link>
        </div>
      </div>

      {/* Footer bottom */}
      <div className="text-center -mx-24   text-sm bg-[#252525] text-gray-500 mt-12 pt-6 border-t border-white/10">
        © Football Barber Club 2025, all rights reserved
      </div>
    </footer>
  );
};

export default Footer;
