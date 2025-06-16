"use client";

import React from "react";
import TiltleDashboardPages from "../dashboard/component/TiltleDashboardPages";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import BarberCard from "./components/CardBarber";
import { useGetBarbers } from "./hook.ts/useBarberApi";

const BarberDashboardPage = () => {
  const router = useRouter();
  const { data, isLoading } = useGetBarbers();
  if (!isLoading) console.log(data);
  const handleSearchBarber = (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log(e.target.value);
  };

  if (!isLoading) console.log(data);
  return (
    <div className="w-full h-full">
      <TiltleDashboardPages title="Barbers">
        <input
          type="search"
          name="search_barber"
          onChange={handleSearchBarber}
          className="border-0 min-w-[320px] mx-3 px-4 py-2 rounded-lg focus:outline-0 focus:bg-gray-200 transition-all duration-200 bg-gray-100"
          placeholder="Search for a barber"
        />
        <Button onClick={() => router.push("/dashboard/barbers/create")}>
          Add a barber
        </Button>
      </TiltleDashboardPages>

      {isLoading ? (
        <div className="flex justify-center items-center mt-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-dark-purple"></div>
          <span className="ml-3  text-gray-600">Loading barbers...</span>
        </div>
      ) : (
        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {data?.map((barber) => (
            <BarberCard
              key={barber.id}
              // appointments={barber.appointments.length || 9}
              appointments={4}
              image={""}
              onView={() => {
                router.push("/dashboard/barbers/" + barber.id);
              }}
              name={barber.fullName}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default BarberDashboardPage;
