"use client";

import HeroAllPage from "@/components/layout/HeroAllPage";
import React, { useEffect, useRef } from "react";
import VideoHero from "./components/VideoCard";
import Image from "next/image";
import Link from "next/link";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// Register ScrollTrigger plugin
gsap.registerPlugin(ScrollTrigger);

const Services: React.FC = () => {
  /* --------------------------- Refs for animations --------------------------- */
  const servicesGridRef = useRef<HTMLDivElement>(null);
  const videoCardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const bannerRef = useRef<HTMLDivElement>(null);
  const bannerImageRef = useRef<HTMLImageElement>(null);
  const bannerContentRef = useRef<HTMLDivElement>(null);
  const bannerTitleRef = useRef<HTMLHeadingElement>(null);
  const bannerSubtitleRef = useRef<HTMLParagraphElement>(null);
  const bannerButtonRef = useRef<HTMLAnchorElement>(null);

  /* --------------------------- GSAP Animations --------------------------- */
  useEffect(() => {
    const ctx = gsap.context(() => {
      // Services grid container animation
      if (servicesGridRef.current) {
        gsap.fromTo(
          servicesGridRef.current,
          {
            opacity: 0,
            y: 60,
          },
          {
            opacity: 1,
            y: 0,
            duration: 0.8,
            ease: "power2.out",
            scrollTrigger: {
              trigger: servicesGridRef.current,
              start: "top 80%",
              end: "bottom 20%",
              toggleActions: "play none none reverse",
            },
          }
        );
      }

      // Individual video cards staggered animation
      videoCardRefs.current.forEach((ref, index) => {
        if (ref) {
          gsap.fromTo(
            ref,
            {
              opacity: 0,
              y: 50,
              scale: 0.9,
            },
            {
              opacity: 1,
              y: 0,
              scale: 1,
              duration: 0.6,
              ease: "power2.out",
              delay: index * 0.1, // Stagger effect
              scrollTrigger: {
                trigger: ref,
                start: "top 85%",
                toggleActions: "play none none reverse",
              },
            }
          );

          // Hover animations for video cards
        }
      });

      // Banner container animation
      if (bannerRef.current) {
        gsap.fromTo(
          bannerRef.current,
          {
            opacity: 0,
            y: 80,
          },
          {
            opacity: 1,
            y: 0,
            duration: 1,
            ease: "power2.out",
            scrollTrigger: {
              trigger: bannerRef.current,
              start: "top 80%",
              toggleActions: "play none none reverse",
            },
          }
        );
      }

      // Banner image animation
      if (bannerImageRef.current) {
        gsap.fromTo(
          bannerImageRef.current,
          {
            scale: 1.1,
            opacity: 0.8,
          },
          {
            scale: 1,
            opacity: 1,
            duration: 1.2,
            ease: "power2.out",
            scrollTrigger: {
              trigger: bannerImageRef.current,
              start: "top 85%",
              toggleActions: "play none none reverse",
            },
          }
        );
      }

      // Banner content staggered animation
      const bannerElements = [
        bannerTitleRef.current,
        bannerSubtitleRef.current,
        bannerButtonRef.current,
      ];
      bannerElements.forEach((element, index) => {
        if (element) {
          gsap.fromTo(
            element,
            {
              opacity: 0,
              y: 30,
            },
            {
              opacity: 1,
              y: 0,
              duration: 0.6,
              ease: "power2.out",
              delay: index * 0.2 + 0.3, // Stagger with initial delay
              scrollTrigger: {
                trigger: bannerRef.current,
                start: "top 80%",
                toggleActions: "play none none reverse",
              },
            }
          );
        }
      });

      // Banner button hover animation
      if (bannerButtonRef.current) {
        const button = bannerButtonRef.current;

        const handleButtonMouseEnter = () => {
          gsap.to(button, {
            scale: 1.05,
            y: -3,
            duration: 0.2,
            ease: "back.out(1.7)",
          });
        };

        const handleButtonMouseLeave = () => {
          gsap.to(button, {
            scale: 1,
            y: 0,
            duration: 0.2,
            ease: "power2.out",
          });
        };

        const handleButtonClick = () => {
          gsap.to(button, {
            scale: 0.95,
            duration: 0.1,
            ease: "power2.out",
            yoyo: true,
            repeat: 1,
          });
        };

        button.addEventListener("mouseenter", handleButtonMouseEnter);
        button.addEventListener("mouseleave", handleButtonMouseLeave);
        button.addEventListener("click", handleButtonClick);

        // Cleanup
        return () => {
          button.removeEventListener("mouseenter", handleButtonMouseEnter);
          button.removeEventListener("mouseleave", handleButtonMouseLeave);
          button.removeEventListener("click", handleButtonClick);
        };
      }

      // Parallax effect for banner image
      if (bannerImageRef.current) {
        gsap.to(bannerImageRef.current, {
          yPercent: -20,
          ease: "none",
          scrollTrigger: {
            trigger: bannerRef.current,
            start: "top bottom",
            end: "bottom top",
            scrub: true,
          },
        });
      }

      // Floating animation for banner content
      if (bannerContentRef.current) {
        gsap.to(bannerContentRef.current, {
          y: -10,
          duration: 2,
          ease: "power2.inOut",
          yoyo: true,
          repeat: -1,
        });
      }
    });

    return () => ctx.revert();
  }, []);

  /* --------------------------- Helper function for setting refs --------------------------- */
  const setVideoCardRef = (el: HTMLDivElement | null, index: number): void => {
    videoCardRefs.current[index] = el;
  };

  return (
    <div>
      <HeroAllPage
        title="SERVICES"
        subTitle="  Discover our premium grooming services"
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
          <div key={index} ref={(el) => setVideoCardRef(el, index)}>
            <VideoHero title="All Over & OAP" />
          </div>
        ))}
      </div>

      <center>
        <div
          ref={bannerRef}
          className="relative mt-24 shadow-md shadow-dark-purple overflow-hidden"
        >
          {/* 🔹 Background Image */}
          <Image
            ref={bannerImageRef}
            src="/images/contactUs.png"
            alt="Barber banner"
            width={1300}
            height={300}
            className="w-full min-h-[300px] max-h-[300px] object-cover"
          />

          {/* 🔹 Overlay Content */}
          <div
            ref={bannerContentRef}
            className="absolute inset-0 flex flex-col items-center justify-center text-center px-4"
          >
            <h2
              ref={bannerTitleRef}
              className="text-light-blue text-2xl sm:text-3xl font-extrabold drop-shadow-md"
            >
              Look Sharp, Feel confident
            </h2>
            <p
              ref={bannerSubtitleRef}
              className="text-white mt-2 text-base sm:text-lg font-medium"
            >
              Book your cut today!
            </p>

            <Link
              ref={bannerButtonRef}
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
