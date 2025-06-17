import { Service } from "@/feature-modules/barber/type";
import Image from "next/image";
import React from "react";
import { BiPound } from "react-icons/bi";

const ServiceCard = ({ item }: { item: Service }) => {
  const duration =
    item.duration === 20
      ? "20 min - 30 min"
      : item.duration === 40
      ? "30 min - 40 min"
      : "40 min - 50 min";

  return (
    <div className="flex flex-col gap-4 py-3 px-4 rounded transition-all duration-200 group hover:bg-dark-purple hover:text-white cursor-pointer">
      {/* Top Row */}
      <div className="flex items-center gap-3">
        <Image
          src={"/" + item.imageUrl}
          alt="service image"
          width={24}
          height={24}
          className="w-6 h-6 filter group-hover:brightness-0 group-hover:invert transition"
        />

        <h1 className="text-xl font-semibold group-hover:text-white text-dark-purple">
          {item.name}
        </h1>
        <span className="text-gray-400 group-hover:text-white">{duration}</span>
      </div>

      {/* Bottom Row */}
      <div className="flex items-center justify-between">
        <p className="text-[16px] line-clamp-1 group-hover:text-white text-gray-800 md:w-[70%]">
          {item.description}
        </p>
        <p className="text-2xl font-bold flex items-center justify-center text-dark-purple group-hover:text-white">
          <BiPound className="mr-1" />
          {item.price}
        </p>
      </div>
    </div>
  );
};

export default ServiceCard;
