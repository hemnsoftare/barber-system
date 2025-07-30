"use client";

import React, { useState } from "react";
import TiltleDashboardPages from "../dashboard/component/TiltleDashboardPages";
import {
  useGetBarbers,
  useRemoveDayOff,
  useUpdateAvailability,
} from "./hook.ts/useBarberApi";
import SelectBarber from "./components/SelectBarber";
import AvailableForm from "./components/AvailableForm";
import { AvailabilityData } from "./CreateBarberDashboardpage";
import { Button } from "@/components/ui/button";
// import DayOffDialog from "./components/DayOffDialog";
// import OffDayList from "./components/OffDayList";
// import DayOffDialog from "./components/DayOffDialog";
import { Barber, DayOffEntry } from "./type";
import OffDayList from "./components/OffDayList";
import DayOffDialog from "./components/DayOffDialog";
import { useUser } from "@clerk/nextjs";
import { toast } from "sonner";

const AvailabilityDashboardPage = () => {
  const { data, isLoading } = useGetBarbers();
  const { mutate: updateDay, isPending: isUpdating } = useUpdateAvailability();
  const { mutate } = useRemoveDayOff();
  const [currentBarber, setCurrentBarber] = useState<Barber>();
  const [availabilities, setAvailabilities] = useState<AvailabilityData[]>([]);
  const { user } = useUser();
  const role = user?.publicMetadata.role as "admin" | "barber";
  const formatTime = (input: unknown): string => {
    if (!input) return "08:00";

    if (typeof input === "string" && input.includes(":")) {
      return input; // Already a time string like "08:00"
    }

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
      "SUNDAY",
      "MONDAY",
      "TUESDAY",
      "WEDNESDAY",
      "THURSDAY",
      "FRIDAY",
      "SATURDAY",
    ];
    const transformed: AvailabilityData[] = daysOfWeek.map((day) => {
      const match = selected.availability?.find(
        (a) => a.dayOfWeek === day.toUpperCase()
      );

      if (!match) {
        return {
          day,
          enabled: false,
          from: "08:00",
          to: "08:00",
        };
      }

      return {
        day,
        enabled: match.isEnabled ?? false,
        from: formatTime(match.startTime),
        to: formatTime(match.endTime),
      };
    });

    setAvailabilities(transformed);
  };
  const handleSave = () => {
    if (role === "barber") {
      toast.error("Only admins can update availability.");
      return;
    }
    if (!currentBarber?.availability) {
      toast.error("No selected barber.");
      return;
    }
    updateDay(
      {
        data: availabilities,
        barberId: currentBarber.id as string,
        dataOld: currentBarber?.availability.map((ava) => ({
          day: ava.dayOfWeek,
          enabled: ava.isEnabled,
          from: ava.startTime,
          to: ava.endTime,
        })),
      },

      {
        onError: (e) => console.log(e),
        onSuccess: () => console.log("success "),
      }
    );
  };
  if (role === "barber" && availabilities.length === 0)
    handleBarberSelect(user?.id as string);
  console.log(currentBarber);
  return (
    <div className="flex px-4 flex-col items-start">
      <TiltleDashboardPages title="Availability" />
      <div className="my-8 w-full">
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
          selectedBarberId={role === "admin" ? currentBarber?.id : user?.id}
          des={role === "barber"}
          onChange={handleBarberSelect}
        />
      </div>

      <div>
        <AvailableForm
          availabilities={availabilities}
          onAvailabilitiesChange={setAvailabilities}
          animation={currentBarber !== undefined}
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
            offDays={(currentBarber.dayOff as DayOffEntry[]) || []}
            onDelete={(entry) => {
              if (!currentBarber) return;

              mutate(
                {
                  barberId: currentBarber.id as string,
                  entryToRemove: entry,
                },
                {
                  onSuccess: () => {
                    // ✅ 1. Update currentBarber's dayOff
                    setCurrentBarber((prev) => {
                      if (!prev) return prev;
                      const updatedDayOff = (
                        prev.dayOff as DayOffEntry[]
                      ).filter(
                        (d) =>
                          !(
                            d.date.toString() === entry.date.toString() &&
                            d.wholeDay === entry.wholeDay &&
                            d.from === entry.from &&
                            d.to === entry.to
                          )
                      );
                      return { ...prev, dayOff: updatedDayOff };
                    });

                    // ✅ 2. Optionally update local data (if you maintain global barber list)
                    if (data) {
                      data.map((barber) =>
                        barber.id === currentBarber.id
                          ? {
                              ...barber,
                              dayOff: (barber.dayOff as DayOffEntry[]).filter(
                                (d) =>
                                  !(
                                    d.date.toString() ===
                                      entry.date.toString() &&
                                    d.wholeDay === entry.wholeDay &&
                                    d.from === entry.from &&
                                    d.to === entry.to
                                  )
                              ),
                            }
                          : barber
                      );
                      // If you store `data` in a state like setData(), update it here
                      // setData(updatedData);
                    }
                  },
                  onError: (err) => {
                    console.error("Failed to remove day off:", err);
                  },
                }
              );
            }}
          />
        )}

        {currentBarber && (
          <DayOffDialog
            role={role}
            offDays={(currentBarber.dayOff as DayOffEntry[]) || []}
            barberId={currentBarber.id as string}
            onSuccess={(newOffDay: DayOffEntry) => {
              // ✅ 1. Update currentBarber state
              setCurrentBarber((prev) => {
                if (!prev) return prev;
                const updatedDayOff = [
                  ...(prev.dayOff as DayOffEntry[]),
                  newOffDay,
                ];
                return { ...prev, dayOff: updatedDayOff };
              });

              // ✅ 2. Update the global list (if managed manually)
              if (data) {
                data.map((barber) =>
                  barber.id === currentBarber?.id
                    ? {
                        ...barber,
                        dayOff: [
                          ...(barber.dayOff as DayOffEntry[]),
                          newOffDay,
                        ],
                      }
                    : barber
                );
                // If you store `data` in a state like setData(), update it here
                // setData(updatedData);
              }
            }}
          />
        )}
      </div>
    </div>
  );
};

export default AvailabilityDashboardPage;
