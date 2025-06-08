"use client";
import React from "react";
import TiltleDashboardPages from "../dashboard/component/TiltleDashboardPages";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { useRouter } from "next/navigation";
const BarberDashboardPage = () => {
  const router = useRouter().push;
  const handleSearchBarber = (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log(e);
  };
  return (
    <div className="bg-red-50d w-full h-full">
      <TiltleDashboardPages title="Barbers">
        <input
          type="search"
          name="search_barber"
          onChange={handleSearchBarber}
          className="border-0 min-w-[320px] mx-3 px-4 py-2 rounded-lg focus:outline-0 focus:bg-gray-200  transition-all duration-200 bg-gray-100"
          placeholder="Search for a barber"
        />
        <Button onClick={() => router("/dashboard/barbers/create")}>
          Add a barber{" "}
        </Button>
      </TiltleDashboardPages>
      <div className="bg-dark-purple mt-12 text-white p-4 w-72 relative">
        {/* Top content */}
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-lg font-semibold">Shad Azad</h3>
            <p className="text-gray-300 text-sm mt-1">{"4"} Appointments</p>
          </div>
          <div className="w-14 h-14  overflow-hidden">
            <Image
              src={"/images/barber.png"}
              alt={"barber"}
              width={62}
              height={49}
              className="object-cover min-w-[73px] min-h-[49px] max-h-[49px] "
            />
          </div>
        </div>

        {/* View button */}
        <div className="mt-6 text-center">
          <button className="bg-white text-[#4b002f] px-4 py-2  shadow hover:opacity-90">
            View
          </button>
        </div>
      </div>
    </div>
  );
};

export default BarberDashboardPage;
