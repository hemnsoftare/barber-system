"use client";
import React from "react";
import Image from "next/image";
import { useGetBarbers } from "@/feature-modules/barber/hook.ts/useBarberApi";
import BarbersSection from "./BarbersSkeleton";
import { Icon } from "@/constants/icons";
import { useRouter } from "next/navigation";

// Reusable barber card
const BarberCard = ({
  name,
  rating,
  image,
  id,
}: {
  name: string;
  rating: number;
  id: string;
  image: string;
}) => {
  const router = useRouter().push;
  return (
    <div
      onClick={() => router("/barbers/" + id)}
      className="flex flex-col items-center gap-2 w-full"
    >
      <Image
        src={"/" + image}
        alt={name}
        width={350}
        height={250}
        className="object-cover w-[350px] grayscale hover:grayscale-0 transition duration-300"
      />
      <div className="flex items-center px-1 w-full justify-between">
        <h2 className="text-dark-purple font-semibold text-lg">{name}</h2>
        <div className="flex items-center justify-center gap-1 text-dark-purple">
          <Icon
            name="star"
            size={16}
            className="text-dark-purple text-[12px]"
          />
          <span>{rating === 0 ? "4" : rating.toFixed(1)}</span>
        </div>
      </div>
    </div>
  );
};

const BarbersHomePage = () => {
  const { data: barbers, isLoading } = useGetBarbers(3);
  const router = useRouter().push;

  return (
    <div className="flex flex-col -mx-24 px-24 w-screen mt-12  items-center justify-between py-10 gap-6">
      <h1 className="text-[#989898] text-center font-bold text-3xl">
        OUR TALENTED BARBERS
      </h1>
      {isLoading ? (
        <BarbersSection />
      ) : (
        barbers && (
          <div className="flex w-full justify-between items-center gap-10">
            {barbers.map((barber, idx) => (
              <BarberCard
                key={idx}
                image={barber.profileImage}
                name={barber.fullName}
                rating={barber.rating}
                id={barber.id as string}
              />
            ))}
          </div>
        )
      )}

      <center>
        <button
          onClick={() => router("/about-us")}
          className="text-white text-xl bg-dark-purple md:hover:bg-dark-purple/85  transition-all  px-7 py-2  "
        >
          View Barbers
        </button>
      </center>
    </div>
  );
};

export default BarbersHomePage;
