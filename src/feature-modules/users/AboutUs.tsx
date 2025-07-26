"use client";
import HeroAllPage from "@/components/layout/HeroAllPage";
import React, { useEffect } from "react";
import { useGetBarbers } from "../barber/hook.ts/useBarberApi";

import Image from "next/image";
import { useSelectedBarber } from "../booking/store";
import { useRouter } from "next/navigation";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useRef } from "react";
gsap.registerPlugin(ScrollTrigger);

const AboutUs = () => {
  const { data: barbers, isLoading } = useGetBarbers();
  const { toggleSelected, clearSelected } = useSelectedBarber();
  const router = useRouter().push;
  const barbersSectionRef = useRef(null);
  const bannerRef = useRef(null);
  const introLineRefs = useRef<(HTMLSpanElement | null)[][]>([]);

  useEffect(() => {
    clearSelected();
  }, [clearSelected]);
  useEffect(() => {
    const ctx = gsap.context(() => {
      // Animate intro lines one by one

      // Animate barber cards
      if (barbersSectionRef.current) {
        gsap.fromTo(
          barbersSectionRef.current,
          { opacity: 0, y: 60 },
          {
            opacity: 1,
            y: 0,
            duration: 1,
            ease: "power2.out",
            scrollTrigger: {
              trigger: barbersSectionRef.current,
              start: "top 85%",
            },
          }
        );
      }

      // Animate banner
      if (bannerRef.current) {
        gsap.fromTo(
          bannerRef.current,
          { opacity: 0, scale: 0.9 },
          {
            opacity: 1,
            scale: 1,
            duration: 1,
            ease: "power2.out",
            scrollTrigger: {
              trigger: bannerRef.current,
              start: "top 85%",
            },
          }
        );
      }
    });

    return () => ctx.revert();
  }, []);
  useEffect(() => {
    const ctx = gsap.context(() => {
      introLineRefs.current.forEach((line, i) => {
        line.forEach((word, j) => {
          gsap.to(word, {
            opacity: 1,
            y: 0,
            duration: 0.5,
            delay: i * 0.3 + j * 0.05,
            ease: "power2.out",
            scrollTrigger: {
              trigger: word,
              start: "top 90%",
              toggleActions: "play none none reverse",
            },
          });
        });
      });
    });

    return () => ctx.revert();
  }, []);

  return (
    <div>
      <HeroAllPage title="About" image="/images/aboutUs.png" />
      <div className="text-dark-purple xl:text-xl text-lg indent-2 my-12 space-y-4">
        {[
          "At Football Barber Club, we’ve been delivering top-tier grooming services since 2015.",
          "Our skilled barbers specialize in classic and modern cuts, precise beard trims, and a premium grooming experience tailored to your style.",
          "More than just a barbershop, we create a space where passion for barbering meets excellence.",
          "Book your appointment today and experience the difference!",
        ].map((line, i) => (
          <span key={i} className="flex flex-wrap gap-x-1 overflow-hidden">
            {line.split(" ").map((word, j) => (
              <span
                key={j}
                ref={(el) => {
                  if (!introLineRefs.current[i]) introLineRefs.current[i] = [];
                  introLineRefs.current[i][j] = el;
                }}
                className="opacity-0 inline translate-y-2"
              >
                {word}
              </span>
            ))}
          </span>
        ))}
      </div>

      <div>
        <h1 className="text-[#480024] my-4 font-semibold">Meet the barbers</h1>
        {/* barbers */}
        <div
          ref={barbersSectionRef}
          className="flex flex-wrap items-center gap-8  justify-center"
        >
          {isLoading
            ? Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={i}
                  className="flex flex-col items-center p-4 bg-gray-200 space-y-4 animate-pulse"
                >
                  <div className="w-[207px] h-[160px] bg-gray-300 rounded-md" />
                  <div className="w-24 h-4 bg-gray-300 rounded" />
                  <div className="w-28 h-10 bg-gray-400 rounded-md" />
                </div>
              ))
            : barbers?.map((barber) => (
                <div
                  key={barber.id}
                  className="w-[207px] flex items-center justify-center flex-col gap-2 "
                >
                  <Image
                    src={barber.profileImage}
                    alt="iamge"
                    width={277}
                    height={228}
                    className="object-cover  min-w-[207px] max-w-[207px] max-h-[190px] min-h-[190px]"
                  />
                  <h1 className="text-dark-purple">{barber.fullName}</h1>
                  <button
                    onClick={() => {
                      toggleSelected(barber);
                      router(`/barbers/${barber.id}`);
                    }}
                    className="px-8 py-2 text-white bg-dark-purple rounded-none"
                  >
                    Read more
                  </button>
                </div>
              ))}
        </div>
      </div>
      <center>
        <div
          ref={bannerRef}
          className="relative max-w-[999px] w-full shadow-md shadow-dark-purple h-[300px] my-12 md:h-[300px] lg:h-[300px] overflow-hidden"
        >
          {/* Background image */}
          <Image
            src="/images/aboutushero.png"
            alt="Barber Tools Background"
            fill
            className="object-cover "
            priority
          />

          {/* Overlay content */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4 text-white">
            <h1 className="text-xl md:text-xl lg:text-xl font-semibold max-w-2xl">
              Ready for a{" "}
              <span className="text-blue-400 font-bold">fresh cut</span> ? Book
              your appointment now and let <br /> our expert barbers{" "}
              <span className="text-blue-300 font-bold">take care</span> of the
              rest!
            </h1>

            <button className="mt-6 bg-white text-black px-6 py-2 rounded shadow hover:bg-gray-200 transition">
              Book an appointment
            </button>
          </div>
        </div>
      </center>
    </div>
  );
};

export default AboutUs;
