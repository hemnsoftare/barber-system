"use client";

import HeroAllPage from "@/components/layout/HeroAllPage";
import React, { useEffect, useRef } from "react";
import VideoHero from "./components/VideoCard";
import Image from "next/image";
import Link from "next/link";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const Services: React.FC = () => {
  const servicesGridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      if (servicesGridRef.current) {
        gsap.fromTo(
          servicesGridRef.current,
          { opacity: 0, y: 50 },
          {
            opacity: 1,
            y: 0,
            duration: 1,
            ease: "power2.out",
            scrollTrigger: {
              trigger: servicesGridRef.current,
              start: "top 80%", // trigger when top of grid hits 80% of viewport
              toggleActions: "play play play play", // play on enter
            },
          }
        );
      }
    });

    return () => ctx.revert();
  }, []);

  return (
    <div>
      <HeroAllPage
        title="SERVICES"
        subTitle="Discover our premium grooming services"
        image="/images/contactUs.png"
      />

      <div
        ref={servicesGridRef}
        className="grid items-center mt-16 justify-start sm:justify-center gap-4"
        style={{ gridTemplateColumns: "repeat(3, 330px)" }}
      >
        <style jsx>{`
          @media (max-width: 1024px) {
            div.grid {
              grid-template-columns: repeat(2, 1fr) !important;
            }
          }
          @media (max-width: 474px) {
            div.grid {
              grid-template-columns: repeat(1, 1fr) !important;
            }
          }
        `}</style>

        {Array.from({ length: 6 }, (_, index) => (
          <div key={index}>
            <VideoHero title="All Over & OAP" />
          </div>
        ))}
      </div>

      <center>
        <div className="relative mt-24 shadow-md shadow-dark-purple overflow-hidden">
          <Image
            src="/images/contactUs.png"
            alt="Barber banner"
            width={1300}
            height={300}
            className="w-full min-h-[300px] max-h-[300px] object-cover"
          />

          <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4">
            <h2 className="text-light-blue text-2xl sm:text-3xl font-extrabold drop-shadow-md">
              Look Sharp, Feel confident
            </h2>
            <p className="text-white mt-2 text-base sm:text-lg font-medium">
              Book your cut today!
            </p>

            <Link
              href="/booking/services"
              className="mt-6 bg-white text-black px-6 py-2 rounded shadow hover:bg-gray-200 transition font-semibold"
            >
              Book an appointment
            </Link>
          </div>
        </div>
      </center>
    </div>
  );
};

export default Services;
