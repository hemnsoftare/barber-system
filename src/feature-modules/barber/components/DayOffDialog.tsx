"use client";

import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Checkbox } from "@/components/ui/checkbox";
import { useState } from "react";
import Input from "@/components/layout/Input";
import { useAddDayOff } from "../hook.ts/useBarberApi";
import { Timestamp } from "firebase/firestore";
import { DayOffEntry } from "../type";

const DayOffDialog = ({
  barberId,
  onSuccess,
  offDays,
}: {
  barberId: string;
  onSuccess?: (entry: DayOffEntry) => void;
  offDays: DayOffEntry[];
}) => {
  console.log(offDays);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [wholeDay, setWholeDay] = useState(false);
  const [from, setFrom] = useState("09:00");
  const [to, setTo] = useState("17:00");

  const { mutate: addDayOff } = useAddDayOff();
  const handleSubmit = () => {
    if (!selectedDate || !barberId) {
      console.log("Early return: missing selectedDate or barberId");
      return;
    }

    // Validate time inputs for partial day
    if (!wholeDay && (!from || !to)) {
      console.log("Early return: partial day but missing from/to times");
      alert("Please select both start and end times for partial day off");
      return;
    }

    const newDateKey = selectedDate.toISOString().split("T")[0];
    console.log("newDateKey:", newDateKey);

    // Convert existing DayOffEntry[] to the format expected by addDayOff
    const filtered = offDays
      .filter((entry) => {
        const entryDateKey = entry.date.toDate().toISOString().split("T")[0];
        const shouldKeep = entryDateKey !== newDateKey;
        console.log(
          `Filtering entry ${entryDateKey}: ${
            shouldKeep ? "keeping" : "removing"
          }`
        );
        return shouldKeep;
      })
      .map((entry) => ({
        date: Timestamp.fromDate(entry.date.toDate()), // Keep as Timestamp
        wholeDay: entry.wholeDay,
        from: entry.from ?? null,
        to: entry.to ?? null,
      }));

    console.log("filtered existing entries:", filtered);

    // Create new entry in the correct format
    const newEntry: DayOffEntry = {
      date: Timestamp.fromDate(selectedDate),
      wholeDay,
      from: wholeDay ? null : from,
      to: wholeDay ? null : to,
    };

    console.log("newEntry:", newEntry);

    // Final combined data
    const updated = [...filtered, newEntry];
    console.log("updated data to send:", updated);

    addDayOff(
      { barberId, data: updated },
      {
        onSuccess: () => {
          console.log("addDayOff success callback called");
          onSuccess?.(newEntry); // For immediate UI update
        },
        onError: (error) => {
          console.error("addDayOff error:", error);
        },
      }
    );
  };

  const isSameDay = (d1: Date, d2: Date) =>
    d1.getDate() === d2.getDate() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getFullYear() === d2.getFullYear();

  const isOffDay = (date: Date): boolean =>
    offDays.some((offDay) => isSameDay(offDay.date.toDate(), date));

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="bg-dark-purple w-[140px] text-white"
        >
          Add Off Day
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Select a day off</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={setSelectedDate}
            modifiers={{
              offDay: (date) => isOffDay(date),
            }}
            disabled={(date) => date < new Date() || isOffDay(date)} // ✅ right here!
            className="rounded-md border"
          />

          <div className="flex items-center gap-3">
            <Checkbox
              id="whole-day"
              checked={wholeDay}
              onCheckedChange={(checked) => setWholeDay(!!checked)}
            />
            <label htmlFor="whole-day" className="text-sm font-medium">
              Whole day
            </label>
            <Checkbox
              id="partial-day"
              checked={!wholeDay}
              onCheckedChange={(checked) => setWholeDay(!checked)}
            />
            <label htmlFor="partial-day" className="text-sm font-medium">
              Part of the day
            </label>
          </div>

          {!wholeDay && (
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="text-sm">From</label>
                <Input
                  type="time"
                  value={from}
                  onChange={(e) => setFrom(e.target.value)}
                />
              </div>
              <div className="flex-1">
                <label className="text-sm">To</label>
                <Input
                  type="time"
                  value={to}
                  onChange={(e) => setTo(e.target.value)}
                />
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="mt-4">
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <DialogClose asChild>
            <Button
              className="bg-green-600 hover:bg-green-700 text-white"
              onClick={handleSubmit}
            >
              Confirm
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
export default DayOffDialog;
