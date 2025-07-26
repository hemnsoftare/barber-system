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
// import { useAddDayOff } from "../hook.ts/useBarberApi";
import { DayOffEntry } from "../type";
import { useAddDayOff } from "../hook.ts/useBarberApi";
import { toDateSafe } from "@/lib/convertTimestamp";
import { toast } from "sonner";

const DayOffDialog = ({
  barberId,
  onSuccess,
  role,
  offDays,
}: {
  barberId: string;
  onSuccess?: (entry: DayOffEntry) => void;
  role: "admin" | "barber";
  offDays: DayOffEntry[];
}) => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [wholeDay, setWholeDay] = useState(false);
  const [from, setFrom] = useState("09:00");
  const [to, setTo] = useState("17:00");

  const isSameDay = (d1: Date, d2: Date) =>
    d1.getDate() === d2.getDate() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getFullYear() === d2.getFullYear();

  const isOffDay = (date: Date): boolean =>
    offDays.some((offDay) => {
      const sameDay = isSameDay(toDateSafe(offDay.date), date);
      return sameDay && offDay.wholeDay; // Only disable full off days
    });

  const { mutate: addDayOff, isPending } = useAddDayOff();

  const handleSubmit = () => {
    if (!selectedDate) return;

    const entry: DayOffEntry = {
      date: selectedDate,
      wholeDay,
      from: wholeDay ? null : from,
      to: wholeDay ? null : to,
    };

    addDayOff(
      {
        barberId,
        newEntry: {
          ...entry,
          date: selectedDate, // if needed, convert to Firestore Timestamp outside
        },
      },
      {
        onSuccess: () => {
          console.log("Day off added successfully");
          // Optional: onSuccess?.(entry);
        },
        onError: (error) => {
          console.error("Failed to add day off:", error);
        },
      }
    );
    if (onSuccess) onSuccess(entry);
    setOpen(false);
  };
  const [open, setOpen] = useState(false);

  return (
    <Dialog
      open={open}
      onOpenChange={(value) => {
        if (value === true && role !== "admin") {
          toast.error("Only admins can add off days.");
          return;
        }
        setOpen(value); // ✅ properly open/close the dialog
      }}
    >
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
            <Button
              disabled={isPending}
              onClick={() => setOpen(false)}
              variant="outline"
            >
              {isPending ? "Cancel" : "Close"}
            </Button>
          </DialogClose>
          <DialogClose asChild>
            <Button
              className="bg-green-600 hover:bg-green-700 text-white"
              onClick={handleSubmit}
              disabled={isPending}
            >
              {isPending ? "Saving..." : "Save Off Day"}
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
export default DayOffDialog;
