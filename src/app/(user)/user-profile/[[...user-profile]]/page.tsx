"use client";

import HeroAllPage from "@/components/layout/HeroAllPage";
import { UserProfile } from "@clerk/nextjs";
import React, { useEffect, useRef } from "react";
import { gsap } from "gsap";

const Page = () => {
  const profileRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (profileRef.current) {
      gsap.fromTo(
        profileRef.current,
        { opacity: 0, y: 40 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: "power2.out",
        }
      );
    }
  }, []);

  return (
    <div className="flex items-center sm:py-12 flex-col gap-12 justify-center">
      <HeroAllPage
        title="Manage your Account"
        subTitle="Easily view and update your personal details, password, and active sessions."
      />

      {/* GSAP animating this */}
      <div ref={profileRef} className="">
        <UserProfile
          appearance={{
            elements: {
              rootBox: {
                height: "400px",
                overflowY: "hidden",
                borderRadius: "4px",
                border: "1px solid #460028",

                // Remove default margin
                margin: "0px",

                // Responsive fix for mobile
                "@media (max-width: 640px)": {
                  height: "640px",
                  marginLeft: "-16px",
                  marginRight: "-16px",
                },
              },
            },
          }}
        />
      </div>
    </div>
  );
};

export default Page;
