// Schedule.tsx
"use client";

import React, { useState } from "react";
import {
  format,
  addWeeks,
  subWeeks,
  startOfWeek,
  isBefore,
  addDays,
  isSameDay,
} from "date-fns";
import { Barber, Service } from "@/feature-modules/barber/type";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { toDateSafe } from "@/lib/convertTimestamp";
import { useFilteredAppointments } from "../useAppointment";
import { Icon } from "@/constants/icons";
import { Timestamp } from "firebase/firestore";
import dayjs, { LOCAL_TZ } from "@/lib/dayjs";
// import { useEffect, useRef } from "react";
// import { gsap } from "gsap";
// import dayjs from "@/lib/dayjs";
const Schedule = ({
  barber,
  onConfirm,
  service,
}: {
  barber: Barber;
  service: Service;
  onConfirm: (info: {
    date: Date;
    time: string;
    dayOffWeek:
      | "SUNDAY"
      | "MONDAY"
      | "TUESDAY"
      | "WEDNESDAY"
      | "THURSDAY"
      | "FRIDAY"
      | "SATURDAY";
  }) => void;
}) => {
  // console.log(barber);
  const [mutate, setmutate] = useState(false);
  console.log(mutate);
  const today = new Date();
  const [weekStart, setWeekStart] = useState(
    startOfWeek(today, { weekStartsOn: 0 })
  );
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string | null>(null);
  const availability = barber?.availability ?? [];
  const dayOff = barber?.dayOff ?? [];
  const serviceDuration = service?.duration ?? 20; // Get service duration

  const dayNameToIndex: Record<string, number> = {
    SUNDAY: 0,
    MONDAY: 1,
    TUESDAY: 2,
    WEDNESDAY: 3,
    THURSDAY: 4,
    FRIDAY: 5,
    SATURDAY: 6,
  };

  const indexToDayName = Object.entries(dayNameToIndex).reduce(
    (acc, [key, val]) => ({ ...acc, [val]: key }),
    {} as Record<number, string>
  );

  const isDateWholeDayOff = (date: Date) => {
    return dayOff?.some(
      (d) => d?.wholeDay && isSameDay(toDateSafe(d.date), date)
    );
  };

  // const isTimeSlotBlocked = (date: Date, time: string) => {
  //   // Convert 12-hour format time to minutes (e.g., "8:00 AM" -> 480)
  //   const timeSlotToMinutes = (timeStr: string) => {
  //     const [timePart, period] = timeStr.split(" ");
  //     const [h, m] = timePart.split(":").map(Number);
  //     let hours = h;
  //     if (period === "PM" && hours !== 12) hours += 12;
  //     if (period === "AM" && hours === 12) hours = 0;
  //     return hours * 60 + m;
  //   };

  //   // Convert 24-hour format time to minutes (e.g., "08:00" -> 480)
  //   const time24ToMinutes = (t: string) => {
  //     const [h, m] = t.split(":").map(Number);
  //     return h * 60 + m;
  //   };

  //   const slotMinutes = timeSlotToMinutes(time);

  //   return dayOff.some((off) => {
  //     if (!isSameDay(toDateSafe(off.date), date)) return false;
  //     if (off.wholeDay) return true;

  //     const from = off.from ? time24ToMinutes(off.from) : 0;
  //     const to = off.to ? time24ToMinutes(off.to) : 1440;

  //     // Check if slot time falls within the blocked period
  //     // Inclusive of 'from', exclusive of 'to'
  //     return slotMinutes >= from && slotMinutes < to;
  //   });
  // };

  // Updated function to check if there's enough continuous time for the service
  const hasEnoughContinuousTime = (date: Date, time: string) => {
    if (!appointments || appointments.length === 0) return true;

    // Convert 12-hour format time to minutes
    const timeSlotToMinutes = (timeStr: string) => {
      const [timePart, period] = timeStr.split(" ");
      const [h, m] = timePart.split(":").map(Number);
      let hours = h;
      if (period === "PM" && hours !== 12) hours += 12;
      if (period === "AM" && hours === 12) hours = 0;
      return hours * 60 + m;
    };

    // Convert timestamp to minutes from start of day
    // const timestampToMinutes = (timestamp: {
    //   seconds: number;
    //   nanoseconds: number;
    // }) => {
    //   const appointmentDate = new Date(timestamp.seconds * 1000);
    //   return appointmentDate.getHours() * 60 + appointmentDate.getMinutes();
    // };
    const timestampToMinutes = (timestamp: {
      seconds: number;
      nanoseconds: number;
    }) => {
      const time = dayjs.unix(timestamp.seconds).tz(LOCAL_TZ);
      return time.hour() * 60 + time.minute();
    };

    const slotMinutes = timeSlotToMinutes(time);
    const slotEndMinutes = slotMinutes + serviceDuration; // Use actual service duration

    // Get all appointments for the same date
    console.log(appointments);
    const dayAppointments = appointments
      .filter(
        (
          appointment
        ): appointment is typeof appointment & { startTime: Timestamp } =>
          // isSameDay(new Date(appointment.startTime.seconds * 1000), date)
          appointment.startTime !== undefined &&
          dayjs
            .unix(appointment.startTime.seconds)
            .tz(LOCAL_TZ)
            .isSame(dayjs(date).tz(LOCAL_TZ))
      )
      .map((appointment) => {
        const startMinutes = timestampToMinutes(appointment.startTime);
        const endMinutes = startMinutes + appointment.service.duration;
        console.log("apppppp");
        console.log(startMinutes);
        console.log(endMinutes);
        return { start: startMinutes, end: endMinutes };
      })
      .sort((a, b) => a.start - b.start);
    // Check if there's any appointment that conflicts with the required service duration
    for (const appointment of dayAppointments) {
      // If the appointment starts before our service ends and ends after our service starts
      if (appointment.start < slotEndMinutes && appointment.end > slotMinutes) {
        return false; // There's a conflict
      }
    }

    return true; // No conflicts found
  };

  // Updated function to check if time slot is blocked by day-off during service duration
  const isServiceDurationBlocked = (date: Date, time: string) => {
    // Convert 12-hour format time to minutes
    const timeSlotToMinutes = (timeStr: string) => {
      const [timePart, period] = timeStr.split(" ");
      const [h, m] = timePart.split(":").map(Number);
      let hours = h;
      if (period === "PM" && hours !== 12) hours += 12;
      if (period === "AM" && hours === 12) hours = 0;
      return hours * 60 + m;
    };

    // Convert 24-hour format time to minutes
    const time24ToMinutes = (t: string) => {
      const [h, m] = t.split(":").map(Number);
      return h * 60 + m;
    };

    const slotMinutes = timeSlotToMinutes(time);
    const slotEndMinutes = slotMinutes + serviceDuration;

    return dayOff.some((off) => {
      if (!isSameDay(toDateSafe(off.date), date)) return false;
      if (off.wholeDay) return true;

      const from = off.from ? time24ToMinutes(off.from) : 0;
      const to = off.to ? time24ToMinutes(off.to) : 1440;

      // Check if any part of the service duration overlaps with the day-off period
      return slotMinutes < to && slotEndMinutes > from;
    });
  };

  const getValidDays = () => {
    const days: { dayName: string; date: Date }[] = [];
    let offset = 0;
    const isMobile = typeof window !== "undefined" && window.innerWidth < 640;
    const maxDays = isMobile ? 5 : 7;

    const MAX_ITERATIONS = 10; // avoid infinite loop
    let attempts = 0;

    while (days.length < maxDays && attempts < MAX_ITERATIONS) {
      const currentWeek = addWeeks(weekStart, offset);
      for (let i = 0; i < 7; i++) {
        const date = addDays(currentWeek, i);
        const dayName = indexToDayName[date.getDay()];
        const entry = availability.find(
          (d) => d.dayOfWeek === dayName && d.isEnabled
        );
        const notPast = !isBefore(date, today) || isSameDay(date, today);
        const notWholeDayOff = !isDateWholeDayOff(date);

        if (entry && notPast && notWholeDayOff) {
          days.push({ dayName, date });
        }

        if (days.length === maxDays) break;
      }
      offset++;
      attempts++;
    }

    return days;
  };

  const validDays = getValidDays();
  const [selectedDate, setSelectedDate] = useState<Date | null>(() => {
    const todayEntry = validDays.find((d) => isSameDay(d.date, today));
    return todayEntry?.date || validDays[0]?.date || null;
  });

  const from = dayjs(selectedDate ?? new Date())
    .tz(LOCAL_TZ)
    .startOf("day")
    .toISOString();

  const to = dayjs(selectedDate ?? new Date())
    .tz(LOCAL_TZ)
    .endOf("day")
    .toISOString();
  const {
    data: appointments,
    // isLoading,
    // error,
    // isError,
  } = useFilteredAppointments({
    filters: {
      barberId: barber.id,
      serviceId: "All",
      from,
      to,
      status: "not-finished",
    },
  });
  // if (!isLoading) console.log(appointments);
  const selectedDayName = selectedDate
    ? indexToDayName[selectedDate.getDay()]
    : "";
  const selectedAvailability = availability.find(
    (d) => d.dayOfWeek === selectedDayName && d.isEnabled
  );

  const nextWeek = () => setWeekStart((prev) => addWeeks(prev, 1));
  const prevWeek = () => setWeekStart((prev) => subWeeks(prev, 1));
  const isAtCurrentWeek = isSameDay(
    weekStart,
    startOfWeek(today, { weekStartsOn: 0 })
  );

  const timeToMinutes = (time: string) => {
    const [h, m] = time.split(":").map(Number);
    return h * 60 + m;
  };

  const minutesToTimeLabel = (minutes: number) => {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    const suffix = h >= 12 ? "PM" : "AM";
    const hour12 = h % 12 === 0 ? 12 : h % 12;
    return `${hour12}:${m.toString().padStart(2, "0")} ${suffix}`;
  };

  const getTimeSection = (
    start: string,
    end: string,
    label: string,
    range: [number, number]
  ) => {
    const startMin = timeToMinutes(start);
    const endMin = timeToMinutes(end);

    const [rangeStart, rangeEnd] = range;
    const sectionStart = Math.max(startMin, rangeStart);
    const sectionEnd = Math.min(endMin, rangeEnd);
    if (sectionStart >= sectionEnd) return null;

    const allSlots: string[] = [];
    const latestStartTime = sectionEnd - serviceDuration;

    for (let t = sectionStart; t <= latestStartTime; t += 20) {
      const timeLabel = minutesToTimeLabel(t);

      if (
        selectedDate &&
        !isServiceDurationBlocked(selectedDate, timeLabel) &&
        hasEnoughContinuousTime(selectedDate, timeLabel)
      ) {
        allSlots.push(timeLabel);
      }
    }

    // If no slots are available for this section, don't show it
    if (allSlots.length === 0) return null;

    const sectionTime = `${minutesToTimeLabel(
      sectionStart
    )} - ${minutesToTimeLabel(sectionEnd)}`;
    return { label, slots: allSlots, sectionTime };
  };

  // const dayRowRef = useRef<HTMLDivElement | null>(null);
  // console.log(selectedDate);
  return (
    <div className="w-full px-6 py-2">
      <div className="flex items-center w-full justify-between sm:justify-center  sm:mb-4">
        <h1 className="text-lg sm:text-3xl text-start lg:text-center w-full text-dark-purple font-bold">
          {format(weekStart, "MMMM yyyy")}
        </h1>
        <div className="space-x-2 flex lg:hidden items-center justify-end w-full">
          <button
            onClick={prevWeek}
            disabled={isAtCurrentWeek}
            className={`px-4 py-2 lg:hidden flex rounded transition-all ${
              isAtCurrentWeek
                ? " text-gray-900 cursor-not-allowed"
                : "text-dark-purple md:hover:bg-gray-50"
            }`}
          >
            <Icon name="next" className="rotate-180  w-6 sm:w-9 h-6 sm:h-9 " />{" "}
          </button>
          <button className="lg:hidden flex" onClick={nextWeek}>
            <Icon
              name="next"
              className=" text-dark-purple w-6 sm:w-9 h-6 sm:h-9"
            />{" "}
          </button>
        </div>
      </div>
      {/* day of week row  */}
      <div className="w-full flex items-center justify-between mb-6">
        <button
          onClick={prevWeek}
          disabled={isAtCurrentWeek}
          className={`px-4 py-2 hidden lg:flex rounded transition-all ${
            isAtCurrentWeek
              ? " text-gray-900 cursor-not-allowed"
              : "text-dark-purple "
          }`}
        >
          <Icon name="next" className="rotate-180 " size={45} />{" "}
        </button>
        <div
          // ref={dayRowRef}
          className="grid grid-cols-5 w-full sm:grid-cols-7 justify-center items-center sm:gap-4 gap-0 text-center"
        >
          {validDays.map(({ dayName, date }, i) => {
            const isSelected = selectedDate && isSameDay(date, selectedDate);
            return (
              <div
                key={i}
                onClick={() => {
                  setSelectedDate(date);
                  setmutate((pre) => !pre);
                }}
                className={`border p-2 sm:p-4 rounded-[2px] cursor-pointer shadow transition-all duration-150 ${
                  isSelected ? "bg-dark-purple text-white" : "bg-white"
                }`}
              >
                <p
                  className={`text-sm w-full lg:hidden ${
                    isSelected ? "text-white" : "text-gray-500"
                  }`}
                >
                  {dayName.slice(0, 3)}
                </p>

                <div
                  className={`text-sm text-center  lg:block  hidden ${
                    isSelected ? "text-white" : "text-gray-500"
                  }`}
                >
                  {dayName}
                </div>
                <div
                  className={`font-semibold text-sm  mt-1 ${
                    isSelected ? "text-white" : "text-dark-purple"
                  }`}
                >
                  {format(date, "do")}
                </div>
              </div>
            );
          })}
        </div>
        <button className="hidden lg:flex" onClick={nextWeek}>
          <Icon name="next" className=" text-dark-purple" size={45} />{" "}
        </button>
      </div>
      {selectedAvailability && selectedDate && (
        <div className="mt-6 w-full mx-auto">
          <Accordion type="multiple" className="w-full">
            {[
              getTimeSection(
                selectedAvailability.startTime,
                selectedAvailability.endTime,
                "Morning",
                [300, 720]
              ),
              getTimeSection(
                selectedAvailability.startTime,
                selectedAvailability.endTime,
                "Afternoon",
                [720, 1020]
              ),
              getTimeSection(
                selectedAvailability.startTime,
                selectedAvailability.endTime,
                "Evening",
                [1020, 1440]
              ),
            ]
              .filter(Boolean)
              .map((section, index) => (
                <AccordionItem
                  key={index}
                  value={`item-${index}`}
                  className="w-full"
                >
                  <AccordionTrigger className="text-lg font-medium">
                    <div className="flex items-center justify-center gap-3 ">
                      <span className="text-lg text-dark-purple">
                        {" "}
                        {section!.label}
                      </span>
                      <span className=" text-sm text-gray-500">
                        ({section!.sectionTime})
                      </span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="flex flex-wrap w-full  gap-4 py-4">
                    {section!.slots.map((slot, i) => (
                      <div
                        key={i}
                        // ref={(el) => {
                        //   if (el) {
                        //     gsap.fromTo(
                        //       el,
                        //       { opacity: 0, y: 10 },
                        //       {
                        //         opacity: 1,
                        //         y: 0,
                        //         duration: 0.3,
                        //         delay: i * 0.05,
                        //         ease: "power2.out",
                        //       }
                        //     );
                        //   }
                        // }}
                        className={`flex justify-between gap-3 py-2 min-h-[45px] max-h-[45px] items-center border px-3   ${
                          selectedTimeSlot === slot
                            ? "border-dark-purple"
                            : "border-gray-400"
                        }`}
                      >
                        <span
                          className={`font-medium text-[16px] ${
                            selectedTimeSlot === slot ? "text-dark-purple" : ""
                          }`}
                          onClick={() => setSelectedTimeSlot(slot)}
                        >
                          {slot}
                        </span>
                        {selectedTimeSlot === slot && (
                          <button
                            className="bg-dark-purple text-white px-4 py-1.5 text-[12px]"
                            onClick={() =>
                              onConfirm({
                                date: selectedDate!,
                                time: slot,
                                dayOffWeek: selectedDayName as
                                  | "SUNDAY"
                                  | "MONDAY"
                                  | "TUESDAY"
                                  | "WEDNESDAY"
                                  | "THURSDAY"
                                  | "FRIDAY"
                                  | "SATURDAY",
                              })
                            }
                          >
                            Continue
                          </button>
                        )}
                      </div>
                    ))}
                  </AccordionContent>
                </AccordionItem>
              ))}
          </Accordion>
        </div>
      )}
    </div>
  );
};

export default Schedule;
