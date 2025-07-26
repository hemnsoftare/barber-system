"use client";

import React, { useState } from "react";
import {
  format,
  addWeeks,
  startOfWeek,
  addDays,
  getDay,
  isBefore,
  isAfter,
  addMinutes,
  setHours,
  setMinutes,
  startOfDay,
} from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Barber } from "@/feature-modules/barber/type"; // Adjust this path

const dayIndexToName = [
  "SUNDAY",
  "MONDAY",
  "TUESDAY",
  "WEDNESDAY",
  "THURSDAY",
  "FRIDAY",
  "SATURDAY",
];

const buildTime = (day: Date, timeStr: string): Date => {
  const [hours, minutes] = timeStr.split(":").map(Number);
  return setMinutes(setHours(new Date(day), hours), minutes);
};

const generateTimeSlots = (from: Date, to: Date): Date[] => {
  const slots: Date[] = [];
  let current = new Date(from);
  if (format(from, "HH:mm") === format(to, "HH:mm") || isAfter(from, to))
    return slots;

  while (isBefore(current, to)) {
    slots.push(new Date(current));
    current = addMinutes(current, 20);
  }
  return slots;
};

const WeekCalendar = ({ barber }: { barber: Barber }) => {
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);

  const getWeekDays = (startDate: Date) => {
    const start = startOfWeek(startDate, { weekStartsOn: 0 });
    return Array.from({ length: 7 }, (_, i) => addDays(start, i));
  };

  // ⚠️ Skip invalid or broken time configs
  const availabilityMap = new Map<string, { from: string; to: string }>();
  barber.availability?.forEach((a) => {
    if (
      a.isEnabled &&
      a.startTime !== a.endTime &&
      a.startTime < a.endTime // skip backwards range
    ) {
      availabilityMap.set(a.dayOfWeek.toUpperCase(), {
        from: a.startTime,
        to: a.endTime,
      });
    }
  });

  const handleNextWeek = () => setCurrentWeek(addWeeks(currentWeek, 1));
  const handlePrevWeek = () => setCurrentWeek(addWeeks(currentWeek, -1));
  const weekDays = getWeekDays(currentWeek);
  const today = startOfDay(new Date());

  return (
    <div className="w-full flex flex-col items-center">
      <h1 className="text-2xl font-bold mb-4">
        {format(currentWeek, "MMMM yyyy")}
      </h1>

      {/* Week Selector */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={handlePrevWeek}
          className="p-2 hover:bg-gray-100 rounded"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <div className="flex gap-1">
          {weekDays.map((day, idx) => {
            const dayName = dayIndexToName[getDay(day)];
            const available = availabilityMap.get(dayName);
            const isAvailable = !!available;
            const isPastDay = isBefore(startOfDay(day), today);

            if (!isAvailable || isPastDay) return null;

            const isSelected =
              selectedDay &&
              format(selectedDay, "yyyy-MM-dd") === format(day, "yyyy-MM-dd");

            return (
              <button
                key={idx}
                onClick={() => setSelectedDay(day)}
                className={`flex flex-col items-center px-4 py-2 border rounded transition-all duration-200 ${
                  isSelected
                    ? "bg-purple-600 text-white border-purple-600"
                    : "bg-white hover:bg-purple-50 border-gray-200"
                }`}
              >
                <span
                  className={`text-sm ${
                    isSelected ? "text-white" : "text-gray-500"
                  }`}
                >
                  {format(day, "EEE")}
                </span>
                <span
                  className={`text-lg font-bold ${
                    isSelected ? "text-white" : "text-purple-600"
                  }`}
                >
                  {format(day, "do")}
                </span>
              </button>
            );
          })}
        </div>

        <button
          onClick={handleNextWeek}
          className="p-2 hover:bg-gray-100 rounded"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Time Slots */}
      {selectedDay &&
        (() => {
          const dayName = dayIndexToName[getDay(selectedDay)];
          const time = availabilityMap.get(dayName);
          if (!time) return null;

          const from = buildTime(selectedDay, time.from);
          const to = buildTime(selectedDay, time.to);
          const now = new Date();

          const slots = generateTimeSlots(from, to).filter((slot) => {
            if (
              format(selectedDay, "yyyy-MM-dd") === format(now, "yyyy-MM-dd")
            ) {
              return isAfter(slot, now);
            }
            return true;
          });

          if (slots.length === 0) {
            return (
              <div className="w-full max-w-5xl text-center py-4">
                <p className="text-gray-500">
                  No available time slots for this day.
                </p>
              </div>
            );
          }

          return (
            <Accordion type="single" collapsible className="w-full max-w-5xl">
              <AccordionItem value="time">
                <AccordionTrigger className="text-left">
                  Available Times — {format(from, "hh:mm a")} to{" "}
                  {format(to, "hh:mm a")}
                </AccordionTrigger>
                <AccordionContent>
                  <div className="flex flex-wrap gap-4 justify-center py-4">
                    {slots.map((slot, i) => (
                      <button
                        key={i}
                        onClick={() =>
                          console.log("Selected time:", format(slot, "hh:mm a"))
                        }
                        className="border px-4 py-2 rounded text-purple-600 hover:bg-purple-600 hover:text-white transition-colors duration-200 border-purple-200 hover:border-purple-600"
                      >
                        {format(slot, "hh:mm a")}
                      </button>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          );
        })()}

      {/* No Available Days Message */}
      {weekDays.every((day) => {
        const dayName = dayIndexToName[getDay(day)];
        const available = availabilityMap.get(dayName);
        const isPastDay = isBefore(startOfDay(day), today);
        return !available || isPastDay;
      }) && (
        <div className="w-full max-w-5xl text-center py-8">
          <p className="text-gray-500">
            No available days this week. Try selecting a different week.
          </p>
        </div>
      )}
    </div>
  );
};

export default WeekCalendar;
