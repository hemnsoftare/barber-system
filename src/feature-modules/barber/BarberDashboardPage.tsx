"use client";

import React, { useState } from "react";
import TiltleDashboardPages from "../dashboard/component/TiltleDashboardPages";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import BarberCard from "./components/CardBarber";
import { useGetBarbers } from "./hook.ts/useBarberApi";
import { useSelectedBarber } from "../booking/store";
import { Icon } from "@/constants/icons";
import { useEffect, useRef } from "react";
import gsap from "gsap";
import { useUser } from "@clerk/nextjs";
import { toast } from "sonner";

const BarberDashboardPage = () => {
  const router = useRouter();
  const { data, isLoading } = useGetBarbers();
  const [showSearch, setShowSearch] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const { user } = useUser();
  const role = user?.publicMetadata.role as "admin" | "barber";
  const { toggleSelected, clearSelected } = useSelectedBarber();
  if (!isLoading) console.log(data);

  const handleSearchBarber = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value.toLowerCase());
  };
  const cardContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isLoading && cardContainerRef.current) {
      gsap.fromTo(
        cardContainerRef.current.children,
        { opacity: 0, y: 20 },
        {
          opacity: 1,
          y: 0,
          stagger: 0.1,
          duration: 0.5,
          ease: "power2.out",
        }
      );
    }
  }, [isLoading, data]);

  return (
    <div className="w-full px-4 h-full">
      <TiltleDashboardPages title={showSearch ? "" : "Barbers"}>
        {/* Desktop search input */}
        <div className="flex items-center  w-full justify-end gap-2">
          <input
            type="search"
            name="search_barber"
            onChange={handleSearchBarber}
            className={`border-0 max-w-full min-w-[320px] mx-3 px-4 py-2 bg-white rounded-lg focus:outline-0 focus:bg-gray-200 transition-all duration-200 hidden sm:block`}
            placeholder="Search for a barber"
          />

          {/* Mobile search icon */}
          <div
            className={`flex items-center ${
              showSearch ? "w-full" : "w-fit"
            } justify-between`}
          >
            <button
              onClick={() => setShowSearch(!showSearch)}
              className="sm:hidden text-dark-purple text-xl px-3"
            >
              <Icon
                name={showSearch ? "close" : "search"}
                className="w-6 h-6"
              />
            </button>

            {/* Mobile search input (revealed on icon click) */}
            {showSearch && (
              <input
                type="search"
                name="search_barber"
                onChange={handleSearchBarber}
                autoFocus
                className="border-0 max-w-[90%] min-w-10/12 sm:hidden px-4 py-2 bg-white rounded-lg focus:outline-0 focus:bg-gray-200 transition-all duration-200"
                placeholder="Search..."
              />
            )}
          </div>
          {/* Add button hidden on mobile if search open */}
          {!showSearch && (
            <Button
              onClick={() => {
                if (role === "admin") router.push("/dashboard/barbers/create");
                else toast.error("Only admins can add new barbers.");
              }}
              className=" block"
            >
              Add a barber
            </Button>
          )}
        </div>
      </TiltleDashboardPages>

      {isLoading ? (
        <div className="flex justify-center items-center mt-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-dark-purple"></div>
          <span className="ml-3  text-gray-600">Loading barbers...</span>
        </div>
      ) : (
        <div
          ref={cardContainerRef}
          className="mt-12 grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 sm:grid-cols-2 w-full gap-6"
        >
          {data
            ?.filter((barber) =>
              barber.fullName.toLowerCase().includes(searchTerm)
            )
            .map((barber) => (
              <BarberCard
                key={barber.id}
                appointments={barber.totalBookings || 0}
                image={barber.profileImage}
                onView={() => {
                  clearSelected();
                  if (role === "admin") {
                    toggleSelected(barber);

                    router.push("/dashboard/barbers/" + barber.id);
                  } else {
                    if (barber.id === user?.id) {
                      toggleSelected(barber);

                      router.push("/dashboard/barbers/profile");
                    } else {
                      toast.error(
                        "Only admins can view other barbers' profiles."
                      );
                    }
                  }
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
