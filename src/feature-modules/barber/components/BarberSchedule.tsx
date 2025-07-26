"use client";
import React from "react";
import { Timestamp } from "firebase/firestore";

// 💡 Accepts Date | Timestamp | string
export type DayOffEntry = {
  date: Date | Timestamp | string;
  wholeDay: boolean;
  from: string | null;
  to: string | null;
};

type WeeklyAvail = {
  dayOfWeek: string;
  isEnabled: boolean;
  startTime: string;
  endTime: string;
};

interface Props {
  availability: WeeklyAvail[];
  dayOff: DayOffEntry[];
}

// 💥 Converts any date input to a real Date object
const toRealDate = (value: Date | Timestamp | string): Date => {
  if (value instanceof Date) return value;
  if (value instanceof Timestamp) return value.toDate();
  return new Date(value); // assuming ISO string
};

const niceDay = (d: string) => d.slice(0, 1) + d.slice(1).toLowerCase();

const prettyDate = (value: Date | Timestamp | string): string => {
  const date = toRealDate(value);
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

export default function BarberSchedule({ availability, dayOff }: Props) {
  return (
    <section className="mt-16">
      <h2 className="text-2xl font-semibold text-dark-purple mb-4">
        Weekly Availability
      </h2>
      <div className=" gap-4 grid-cols-7 xl:text-xl grid">
        {availability.map(({ dayOfWeek, isEnabled, startTime, endTime }) => (
          <div
            key={dayOfWeek}
            className={`rounded border p-4 text-white flex flex-col gap-1 ${
              isEnabled ? "bg-dark-purple" : "bg-dark-purple"
            }`}
          >
            <span className="font-medium ">{niceDay(dayOfWeek)}</span>
            {isEnabled ? (
              <span className="text-sm text-gray-300">
                {startTime} – {endTime}
              </span>
            ) : (
              <span className="text-sm text-gray-300">Closed</span>
            )}
          </div>
        ))}
      </div>

      {dayOff.length > 0 && (
        <>
          <h2 className="text-2xl font-semibold text-dark-purple mt-12 mb-4">
            Upcoming Day-Offs
          </h2>
          <ul className="grid grid-cols-7 gap-8">
            {dayOff.map(({ date, wholeDay, from, to }, index) => {
              const realDate = toRealDate(date);
              return (
                <li
                  key={realDate.getTime() + index}
                  className="flex flex-col   bg-dark-purple text-white rounded p-4"
                >
                  <span className="font-medium">{prettyDate(realDate)}</span>
                  {wholeDay ? (
                    <span className="text-sm text-gray-200">
                      Closed all day
                    </span>
                  ) : (
                    <span className="text-sm text-gray-200">
                      Closed {from} – {to}
                    </span>
                  )}
                </li>
              );
            })}
          </ul>
        </>
      )}
    </section>
  );
}
