"use client";
import Image from "next/image";
import React, { useEffect, useRef } from "react";
import { gsap } from "gsap";

const HeroAllPage = ({
  title,
  subTitle,
  image = "/images/bg-servics.png",
}: {
  title: string;
  subTitle?: string;
  image?: string;
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Timeline for coordinated animations
      const tl = gsap.timeline({ defaults: { ease: "power2.out" } });

      // Image animation - fade in with scale
      tl.fromTo(
        imageRef.current,
        {
          opacity: 0,
          scale: 1.1,
        },
        {
          opacity: 1,
          scale: 1,
          duration: 1.2,
        }
      );

      // Title animation - slide up with fade
      tl.fromTo(
        titleRef.current,
        {
          opacity: 0,
          y: 50,
          scale: 0.9,
        },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.8,
        },
        "-=0.6" // Start 0.6 seconds before previous animation ends
      );

      // Subtitle animation - slide up with fade (if exists)
      if (subtitleRef.current) {
        tl.fromTo(
          subtitleRef.current,
          {
            opacity: 0,
            y: 30,
          },
          {
            opacity: 1,
            y: 0,
            duration: 0.6,
          },
          "-=0.4" // Start 0.4 seconds before previous animation ends
        );
      }

      // Container fade in
      tl.fromTo(
        containerRef.current,
        {
          opacity: 0,
        },
        {
          opacity: 1,
          duration: 0.3,
        },
        0
      );
    }, containerRef);

    return () => ctx.revert(); // Cleanup
  }, []);

  return (
    <div
      ref={containerRef}
      className="flex  items-center   min-h-[305px] justify-center flex-col "
    >
      {/* Responsive Image Container */}
      <Image
        ref={imageRef}
        src={image}
        alt="Hero background image"
        priority
        width={300}
        height={400}
        sizes="100vw"
        className="object-cover w-full h-full shadow-md shadow-dark-purple absolute top-0 left-0 max-h-[270px] min-h-[375px] lg:min-h-[455px] lg:max-h-[455px] z-[-1]"
        style={{
          objectFit: "cover",
          objectPosition: "center",
        }}
      />
      {/* Overlay for better text readability */}

      {/* Content */}
      <div className="relative z-10 text-center px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
        <h1
          ref={titleRef}
          className="text-white text-2xl sm:text-3xl md:text-4xl lg:text-[40px] xl:text-5xl font-bold mb-2 sm:mb-4 leading-tight"
        >
          {title}
        </h1>
        {subTitle && (
          <h2
            ref={subtitleRef}
            className="text-light-blue text-lg sm:text-xl md:text-2xl lg:text-[29px] xl:text-3xl font-semibold leading-relaxed"
          >
            {subTitle}
          </h2>
        )}
      </div>
    </div>
  );
};

export default HeroAllPage;
