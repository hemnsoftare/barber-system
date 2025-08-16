import { Service } from "@/feature-modules/barber/type/type";
import React from "react";
import { BiPound } from "react-icons/bi";
import { CldImage } from "next-cloudinary";

const ServiceCard = ({
  item,
  onClickService,
  isSelected,
  showCircal = false,
}: {
  item: Service;
  onClickService?: () => void;
  isSelected?: boolean;
  showCircal?: boolean;
}) => {
  const duration =
    item?.duration === 20
      ? "20 min - 30 min"
      : item?.duration === 40
      ? "30 min - 40 min"
      : "40 min - 50 min";

  return (
    <div
      onClick={onClickService}
      className="flex flex-col w-full bg-white lg:bg-white-bg gap-4 py-3 md:px-4 px-3 rounded transition-all duration-200 group hover:bg-dark-purple hover:text-white cursor-pointer"
    >
      {/* Top Row */}
      <div className="flex items-center sm:gap-3 gap-1 w-full relative">
        <CldImage
          width="24"
          height="24"
          src={item?.imageUrl}
          sizes="24px"
          removeBackground
          alt="Description of my image"
          className="w-6 h-6 transition-all duration-300 group-hover:filter group-hover:brightness-0 group-hover:invert group-hover:contrast-200"
        />

        <h1 className="lg:text-xl text-sm font-semibold line-clamp-1 group-hover:text-white text-dark-purple">
          {item?.name}
        </h1>

        <span className="text-gray-400 hidden lg:block group-hover:text-white">
          {duration && ""}
        </span>

        {/* Selection Indicator */}
        {showCircal && (
          <div
            className={`sm:ml-auto absolute hidden top-1 right-0 sm:w-6 sm:h-6 w-3 h-3 rounded-full  items-center justify-center border-2 transition-all duration-200 ${
              isSelected
                ? "bg-dark-purple border-dark-purple group-hover:bg-white group-hover:border-white"
                : "border-dark-purple group-hover:border-white"
            }`}
          >
            {isSelected && (
              <div className="sm:w-2 sm:h-2 w-1 h-1  bg-white group-hover:bg-dark-purple rounded-full"></div>
            )}
          </div>
        )}
      </div>

      {/* Bottom Row */}
      <div className="flex items-center justify-between">
        <p className="text-[12px] lg:text-[16px] line-clamp-2 lg:line-clamp-1 group-hover:text-white text-gray-800 md:w-[70%]">
          {item.description}
        </p>
        <p className="text-2xl font-bold hidden lg:flex items-center  justify-center text-dark-purple group-hover:text-white">
          <BiPound className="mr-1" />
          {item.price}
        </p>
      </div>
      <div className="flex items-center justify-between lg:hidden">
        <span className="text-gray-400 text-[12px] block group-hover:text-white">
          {duration}
        </span>
        <p className="text-lg font-bold  flex items-center  justify-center text-dark-purple group-hover:text-white">
          <BiPound className="mr-1" />
          {item.price}
        </p>
      </div>
    </div>
  );
};

export default ServiceCard;
