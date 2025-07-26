"use client";
import React, { useEffect, useRef } from "react";
import Image from "next/image";
import { useGetBarbers } from "@/feature-modules/barber/hook.ts/useBarberApi";
import BarbersSection from "./BarbersSkeleton";
import { Icon } from "@/constants/icons";
import { useRouter } from "next/navigation";
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

// 🔁 Barber Card Component
const BarberCard = ({
  name,
  rating,
  image,
  id,
  cardRef,
}: {
  name: string;
  rating: number;
  id: string;
  image: string;
  index: number;
  cardRef: (el: HTMLDivElement | null) => void;
}) => {
  const router = useRouter();

  return (
    <div
      ref={cardRef}
      onClick={() => router.push("/barbers/" + id)}
      className="flex flex-col items-center gap-2 w-[250px] cursor-pointer"
    >
      <Image
        src={image}
        alt={name}
        width={350}
        height={250}
        className="object-cover max-w-[250px] max-h-[250px] grayscale hover:grayscale-0 transition duration-300"
      />
      <div className="flex items-center px-1 w-full justify-between">
        <h2 className="text-white font-semibold text-lg">{name}</h2>
        <div className="flex items-center justify-center gap-1 text-white">
          <Icon name="star" size={16} className="text-white text-[12px]" />
          <span>{rating === 0 ? "4.0" : rating.toFixed(1)}</span>
        </div>
      </div>
    </div>
  );
};

const BarbersHomePage = () => {
  const { data: barbers, isLoading } = useGetBarbers(3);
  const router = useRouter();
  const cardsRef = useRef<(HTMLDivElement | null)[]>([]);

  // Animation on scroll
  useEffect(() => {
    if (!barbers || barbers.length === 0) return;

    cardsRef.current.forEach((card, i) => {
      if (!card) return;
      gsap.from(card, {
        opacity: 0,
        y: 40,
        duration: 0.5,
        delay: i * 0.15,
        ease: "power2.out",
        scrollTrigger: {
          trigger: card,
          start: "top 90%",
        },
      });
    });

    return () => {
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
    };
  }, [barbers]);

  return (
    <div className="flex flex-col overflow-x-hidden bg-black lg:-mx-24 lg:px-24 md:-mx-8 md:px-8 px-4 -mx-4 max-w-screen mt-12 items-center justify-between py-10 gap-6">
      <h1 className="text-[#989898] text-center font-bold text-2xl md:text-3xl">
        OUR TALENTED BARBERS
      </h1>

      {isLoading ? (
        <BarbersSection />
      ) : barbers && barbers.length > 0 ? (
        <div className="flex w-full overflow-x-auto lg:overflow-x-hidden justify-start lg:justify-center items-center gap-8">
          {barbers.map((barber, idx) => (
            <BarberCard
              key={barber.id}
              image={barber.profileImage}
              name={barber.fullName}
              rating={barber.rating}
              id={barber.id as string}
              index={idx}
              cardRef={(el) => (cardsRef.current[idx] = el)}
            />
          ))}
        </div>
      ) : (
        <div className="text-3xl text-white font-semibold text-center mt-8">
          No barbers found.
        </div>
      )}

      <center>
        <button
          onClick={() => router.push("/about-us")}
          className="text-light-blue md:hover:bg-light-blue md:hover:text-white transition-all mt-6 px-4 py-1 border-light-blue border-2"
        >
          View Barbers
        </button>
      </center>
    </div>
  );
};

export default BarbersHomePage;
