"use client";
import React from "react";
import SectionTitle from "./SectionTitle";
import ServiceCard from "./servicesCard";
import Image from "next/image";
import { useGetServices } from "@/feature-modules/barber/hook.ts/useSerices";
import ServicesSkeleton from "./ServicesSkeleton";
import { useRouter } from "next/navigation";
const Services = () => {
  const { data, isLoading } = useGetServices(6);
  const router = useRouter().push;
  return (
    <div className="flex items-center justify-center w-full flex-col ">
      <SectionTitle title="Our Services" />
      {isLoading ? (
        <ServicesSkeleton />
      ) : (
        data && (
          <div className="flex items-center w-full h-[368px] justify-between gap-16">
            <div className="flex flex-col w-full h-full justify-between  ">
              <ServiceCard item={data[0]} />
              <hr className="w-full min-h-[2px] bg-gray-300" />
              <ServiceCard item={data[1]} />
              <hr className="w-full min-h-[2px] bg-gray-300" />

              <ServiceCard item={data[2]} />
            </div>
            <div className="w-[290px]  h-[368px] relative">
              <Image
                src={"/images/bg-sign-in.jpg"}
                alt="iamge "
                width={290}
                height={368}
                priority
                className="max-w-[290px] min-w-[290px]  min-h-[368px] z-[1] brightness-50 object-cover max-h-[368px]"
              />
              <div className="absolute  text-2xl text-center  text-white  font-black z-[2] w-full top-[159px] left-0  ">
                <p>Fades, trims, and </p>
                <p>
                  {" "}
                  <span className="text-light-blue"> everything</span> in
                  between.
                </p>
                <p>
                  {" "}
                  We <span className="text-light-blue"> do</span> it all.
                </p>
              </div>
            </div>
            <div className="flex flex-col w-full gap-4">
              <ServiceCard item={data[3]} />
              <hr className="w-full min-h-[2px] bg-gray-300" />

              <ServiceCard item={data[4]} />
              <hr className="w-full min-h-[2px] bg-gray-300" />

              <ServiceCard item={data[5]} />
            </div>
          </div>
        )
      )}
      <button
        onClick={() => router("/booking/services")}
        className=" bg-dark-purple  text-white text-center py-3  max-w-[290px] min-w-[290px] mt-5 "
      >
        Book an appointment
      </button>
    </div>
  );
};

export default Services;
