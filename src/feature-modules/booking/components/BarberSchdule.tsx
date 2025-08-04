import Image from "next/image";
import React from "react";
import { Barber } from "@/feature-modules/barber/type";
import { Icon } from "@/constants/icons";

interface BarberCardProps {
  barber: Barber;
  isSelected: boolean;
  onClick: () => void;
}

const BarberSchdule: React.FC<BarberCardProps> = ({
  barber,
  isSelected,
  onClick,
}) => {
  return (
    <div
      onClick={onClick}
      className="min-w-[250px] max-w-full w-[360px] px-3 py-3 bg-dark-purple text-white flex items-center justify-between cursor-pointer transition-all duration-200 hover:opacity-90"
    >
      {/* Left: Profile + Name + Rating */}
      <div className="flex items-center gap-3">
        <Image
          src={barber.profileImage}
          alt="image"
          width={56}
          height={56}
          className="size-14 object-cover rounded-full"
        />
        <div className="flex flex-col">
          <p className="text-[16px] font-medium">{barber.fullName}</p>
          <div className="text-[14px] flex items-center gap-1">
            <Icon size={16} name="star" color="#CFCFCF" />
            <span>
              {barber.rating === 0 ? "3" : barber.rating.toFixed(1)} Rating
            </span>
          </div>
        </div>
      </div>

      {/* Right: Selection Indicator */}
      <div className="w-7 h-7 rounded-full border-2  bg-white flex items-center justify-center">
        {isSelected && <div className="w-5 h-5 rounded-full bg-dark-purple " />}
      </div>
    </div>
  );
};

export default BarberSchdule;
