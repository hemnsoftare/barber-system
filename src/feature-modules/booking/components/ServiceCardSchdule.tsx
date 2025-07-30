"use client";
import { BiPound } from "react-icons/bi";
import { Service } from "../../barber/type";
import { CldImage } from "next-cloudinary";
import { useEffect, useRef } from "react";
import { gsap } from "gsap";
const ServiceCard = ({ item }: { item: Service }) => {
  const duration =
    item.duration === 20
      ? "20 min - 30 min"
      : item.duration === 40
      ? "30 min - 40 min"
      : "40 min - 50 min";
  const cardRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    if (cardRef.current) {
      gsap.fromTo(
        cardRef.current,
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 0.6,
          ease: "power2.out",
        }
      );
    }
  }, []);

  return (
    <div
      ref={cardRef}
      className="flex items-center mt-6 sm:flex-row flex-col gap-2 sm:gap-4 py-2  px-3 sm:px-4  transition-all duration-200 w-full sm:w-[75%] lg:w-[50%] group hover:bg-dark-purple justify-between hover:text-white cursor-pointer border-2 border-dark-purple"
    >
      <div className="flex w-full justify-between gap-4 flex-col ">
        {/* Top Row */}
        <div className="flex items-center  w-full justify-between gap-3 relative">
          <div className="flex items-center justify-center gap-4">
            <CldImage
              width="24"
              height="24"
              src={item.imageUrl}
              sizes="24px"
              removeBackground
              alt="Description of my image"
              className="w-6 h-6 transition-all duration-300 group-hover:filter group-hover:brightness-0 group-hover:invert group-hover:contrast-200"
            />

            <h1 className="text-xl font-semibold group-hover:text-white text-dark-purple">
              {item.name}
            </h1>

            <span className="text-gray-600 sm:block hidden group-hover:text-white">
              {duration}
            </span>
          </div>
          <span className="bg-dark-purple sm:hidden font-semibold text-white px-3 py-1">
            Selected
          </span>
          {/* Selection Indicator */}
        </div>

        {/* Bottom Row */}
        <div className="flex items-center justify-between">
          <p className="text-[16px]  group-hover:text-white text-gray-800 m">
            {item.description}
          </p>
        </div>
      </div>
      <p className="px-6 sm:flex py-2 font-bold hidden items-center text-white justify-center bg-dark-purple group-hover:text-white">
        Selected <BiPound className="mr-1" />
        {item.price}
      </p>
      <div className="flex sm:hidden items-center w-full justify-between">
        <span className="text-gray-600   group-hover:text-white">
          {duration}
        </span>
        <span className="flex items-center justify-center ">
          {" "}
          <BiPound className="mr-1" />
          {item.price}
        </span>
      </div>
    </div>
  );
};
export default ServiceCard;
