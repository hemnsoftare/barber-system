"use client";
import React, { useState } from "react";
import TiltleDashboardPages from "../dashboard/component/TiltleDashboardPages";
import { useSelectedUser } from "./store";
import { useFilteredAppointments } from "../booking/useAppointment";
import Image from "next/image";
import { Icon } from "@/constants/icons";
import { convertToDate } from "@/lib/convertTimestamp";
import AppointmentCardSkeleton from "./components/AppointmentCardSkeleton";
import { CldImage } from "next-cloudinary";

const tabs = ["all", "not-finished", "finished", "cancelled", "expired"];

export default function SingalUserDashboard() {
  const { selectedUser: user } = useSelectedUser();
  const { isLoading, data: appointments = [] } = useFilteredAppointments({
    filters: {
      userid: "user_2xzFq8rlMKmMpKHIHMZcNjEdqKO",
      barberId: "All",
      serviceId: "All",
    },
  });

  const [currentTab, setCurrentTab] = useState("all");

  const filtered = appointments.filter((a) =>
    currentTab === "all" ? true : a.status === currentTab
  );
  if (!isLoading) console.log(appointments);
  return (
    <div className="space-y-6">
      <TiltleDashboardPages title={user?.fullName || ""} showBackBotton />

      <div className="bg-white rounded-xl shadow p-6 space-y-4">
        <div className="flex items-center gap-4">
          <Image
            src={user?.image || "" || "/placeholder-user.jpg"}
            alt={user?.fullName || ""}
            width={60}
            height={60}
            className="rounded-full size-14 object-cover"
          />
          <div>
            <h2 className="text-xl font-semibold">{user?.fullName || ""}</h2>
            <p className="text-sm text-gray-600">{user?.email || ""}</p>
            <p className="text-sm text-gray-400">ID: {user?.id || ""}</p>
          </div>
        </div>
      </div>

      <div className="flex overflow-x-auto gap-2">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setCurrentTab(tab)}
            className={`sm:px-4 px-2 py-2 min-w-[130px] font-medium text-lg rounded-t-lg ${
              currentTab === tab
                ? " text-dark-purple border-b-2 border-dark-purple"
                : "text-dark-purple md:hover:border-b-2 border-dark-purple"
            }`}
          >
            {currentTab === tab && filtered.length}{" "}
            {tab === "all"
              ? "All"
              : tab.replace("-", " ").replace(/\b\w/g, (l) => l.toUpperCase())}
          </button>
        ))}
      </div>

      {isLoading ? (
        <AppointmentCardSkeleton />
      ) : filtered.length === 0 ? (
        <div className="text-center text-gray-500 py-10">
          No appointments found for this status.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 mt-6">
          {filtered.map((appointment) => {
            const dateObj = convertToDate(appointment.date);
            const startObj = convertToDate(appointment.startTime);
            const endObj = new Date(
              startObj.getTime() + appointment.service.duration * 60000
            );

            return (
              <div
                key={appointment.id}
                className="border flex flex-col gap-6 p-4 rounded-lg text-white bg-dark-purple shadow hover:shadow-lg transition-shadow"
              >
                <div className="flex items-center justify-between w-full mb-4   gap-2 sm:gap-3">
                  <div className="flex w-full gap-3 flex-col items-start  ">
                    <p className="flex text-sm sm:text-[16px] items-center gap-2">
                      <Icon
                        name="appoitment"
                        color="#ffffff"
                        className="w-5 sm:w-6 sm:h-6 h-5"
                      />
                      <span>{dateObj.toLocaleDateString()}</span>
                    </p>
                    <p className="flex text-sm sm:text-[16px] items-center gap-2">
                      <Icon
                        name="clock"
                        color="#ffffff"
                        className="w-5 sm:w-6 sm:h-6 h-5"
                      />
                      <span className="relative top-0.5">
                        {startObj.toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                          hour12: false,
                        })}{" "}
                        -{" "}
                        {endObj.toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </p>
                  </div>

                  <div className="flex flex-col gap-3 w-full items-start justify-center">
                    <p className="flex items-center  gap-1">
                      <CldImage
                        width="24"
                        height="24"
                        src={appointment.service.imageUrl}
                        sizes="24px"
                        removeBackground
                        alt="Description of my image"
                        className="w-5 sm:w-6 sm:h-6 h-5 filter invert brightness-0"
                      />
                      <span className="ml-2 text-sm sm:text-[16px] text-white">
                        {appointment.service.name}
                      </span>
                    </p>

                    <p className="flex text-sm sm:text-[16px] items-center gap-1">
                      <Icon
                        className="w-5 sm:w-6 sm:h-6 h-5"
                        name="barber"
                        color="#ffffff"
                      />
                      <span className="ml-2">
                        {appointment.barber.fullName}
                      </span>
                    </p>
                  </div>
                </div>
                <h1 className="w-full text-center text-white font-semibold ">
                  {appointment.status}
                </h1>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
