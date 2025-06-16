"use client";

import React, { useState } from "react";
import TiltleDashboardPages from "../dashboard/component/TiltleDashboardPages";
import {
  useAddDayOff,
  useGetBarbers,
  useUpdateAvailability,
} from "./hook.ts/useBarberApi";
import SelectBarber from "./components/SelectBarber";
import AvailableForm from "./components/AvailableForm";
import { AvailabilityData } from "./CreateBarberDashboardpage";
import { Button } from "@/components/ui/button";
// import DayOffDialog from "./components/DayOffDialog";
import OffDayList from "./components/OffDayList";
import DayOffDialog from "./components/DayOffDialog";
import { Barber } from "./type";

const AvailabilityDashboardPage = () => {
  const { data, isLoading } = useGetBarbers();
  const { mutate: updateDay, isPending: isUpdating } = useUpdateAvailability();
  const { mutate: addDayOff } = useAddDayOff();

  const [availabilities, setAvailabilities] = useState<AvailabilityData[]>([]);
  const [currentBarber, setCurrentBarber] = useState<Barber>();

  const formatTime = (input: unknown): string => {
    if (!input) return "08:00";
    if (typeof input === "object" && input !== null && "seconds" in input) {
      const millis =
        (input as { seconds: number; nanoseconds: number }).seconds * 1000;
      return new Date(millis).toTimeString().slice(0, 5);
    }
    const date = new Date(input as string | number | Date);
    if (!isNaN(date.getTime())) {
      return date.toTimeString().slice(0, 5);
    }
    return "08:00";
  };

  const handleBarberSelect = (id: string) => {
    if (!data) return;
    const selected = data.find((barber) => barber.id === id);
    if (!selected) return;

    setCurrentBarber(selected);

    const daysOfWeek = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];

    const transformed: AvailabilityData[] = daysOfWeek.map((day) => {
      const match = selected.availability?.find(
        (a) => a.dayOfWeek === day.toUpperCase()
      );
      return {
        day,
        enabled: match?.isEnabled ?? false,
        from: formatTime(match?.startTime),
        to: formatTime(match?.endTime),
      };
    });

    setAvailabilities(transformed);
  };

  const handleSave = () => {
    if (!currentBarber) return;
    console.log(availabilities);
    updateDay({ data: availabilities, barberId: currentBarber.id as string });
  };

  return (
    <div className="flex flex-col items-start">
      <TiltleDashboardPages title="Availability" />
      <div className="my-8">
        <SelectBarber
          barbers={
            data
              ?.filter((item) => typeof item.id === "string")
              .map((item) => ({
                name: item.fullName,
                id: item.id as string,
              })) ?? []
          }
          isLoading={isLoading}
          onChange={handleBarberSelect}
        />
      </div>

      <div>
        <AvailableForm
          availabilities={availabilities}
          onAvailabilitiesChange={setAvailabilities}
        />
      </div>

      <div className="my-6">
        <Button
          onClick={handleSave}
          disabled={isUpdating || !currentBarber}
          className="bg-dark-purple w-[140px]"
        >
          {isUpdating ? "Saving..." : "Save Availability"}
        </Button>
      </div>

      <div className="mt-4">
        {currentBarber && (
          <OffDayList
            offDays={currentBarber.dayOff || []}
            onDelete={(entry) => {
              console.log("Deleting entry:", entry);
              console.log("Current dayOff array:", currentBarber.dayOff);

              const filteredData =
                currentBarber.dayOff?.filter((item) => {
                  // Convert both dates to comparable format (date strings)
                  const itemDateStr = item.date
                    .toDate()
                    .toISOString()
                    .split("T")[0];
                  const entryDateStr = entry.date
                    .toDate()
                    .toISOString()
                    .split("T")[0];

                  console.log(
                    `Comparing: ${itemDateStr} !== ${entryDateStr} = ${
                      itemDateStr !== entryDateStr
                    }`
                  );

                  return itemDateStr !== entryDateStr;
                }) || [];

              console.log("Filtered data:", filteredData);

              addDayOff(
                {
                  data: filteredData,
                  barberId: currentBarber.id as string,
                },
                {
                  onSuccess: () => {
                    setCurrentBarber((prev) =>
                      prev ? { ...prev, dayOff: filteredData } : prev
                    );

                    // ✅ update barbers list (global data)
                    if (data) {
                      data.map((barber) =>
                        barber.id === currentBarber.id
                          ? { ...barber, dayOff: filteredData }
                          : barber
                      );
                      // OPTIONAL: if you store `data` in state, you'd do setData(updated)
                    }
                  },
                }
              );
            }}
          />
        )}
        {currentBarber && (
          <DayOffDialog
            barberId={currentBarber.id as string}
            offDays={currentBarber.dayOff || []}
            onSuccess={(newEntry) => {
              if (!newEntry) return;

              setCurrentBarber((prev) =>
                prev
                  ? {
                      ...prev,
                      dayOff: [...(prev.dayOff || []), newEntry],
                    }
                  : prev
              );

              if (data) {
                data.map((barber) =>
                  barber.id === currentBarber.id
                    ? {
                        ...barber,
                        dayOff: [...(barber.dayOff || []), newEntry],
                      }
                    : barber
                );

                // You may want to set this updated data to your global state or refetch
                // (you can lift `data` and `setData` to a parent or global state if needed)
              }
            }}
          />
        )}
      </div>
    </div>
  );
};

export default AvailabilityDashboardPage;
