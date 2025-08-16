"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { format } from "date-fns";
import { Barber } from "@/feature-modules/barber/type/type";

interface AppointmentConfirmationDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: () => void;
  barber: Barber;
  service: {
    title: string;
    price: number;
    duration: number; // in minutes
  };
  datetime: {
    date: Date;
    time: string; // e.g., "12:20 PM"
  };
  isPending?: boolean; // Optional prop for pending state
  isupdate?: boolean;
  nameUser?: string;
}

const AppointmentConfirmationDialog = ({
  open,
  onClose,
  onSubmit,
  barber,
  service,
  datetime,
  isupdate = false,
  isPending,
  nameUser,
}: AppointmentConfirmationDialogProps) => {
  const formattedDate = format(datetime.date, "d/M/yyyy");
  const startTime = datetime.time;
  const endTime = calculateEndTime(startTime, service.duration); // 🧠 dynamic duration!

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="w-[330px] sm:w-[570px]  p-2 sm:p-6">
        <DialogHeader>
          <DialogTitle className="text-center sm:text-xl text-lg text-dark-purple font-semibold">
            Appointment details confirmation
          </DialogTitle>
        </DialogHeader>

        <div className="sm:space-y-5 space-y-2 text-sm text-dark-purple mt-4">
          {nameUser && (
            <div>
              <p className="text-gray-500 font-medium">Name Client :</p>
              <p className="text-lg font-bold">{nameUser}</p>
            </div>
          )}
          <div>
            <p className="text-gray-500 font-medium">Service :</p>
            <p className="text-lg font-bold">{service.title}</p>
          </div>

          <div className="flex justify-between items-center">
            <div>
              <p className="text-gray-500 font-medium">Barber :</p>
              <p className="text-lg font-bold">{barber.fullName}</p>
            </div>
            <div className="text-lg  font-bold">£{service.price}</div>
          </div>

          <div>
            <p className="text-gray-500 font-medium">Date & Time :</p>
            <p className="text-lg font-bold">
              {formattedDate}, {startTime} - {endTime}
            </p>
          </div>
        </div>

        <div className="sm:mt-6  flex w-full items-center justify-center gap-3 sm:gap-5 text-center">
          <button
            onClick={onClose}
            className="w-full hidden border-dark-purple border font-bold text-sm lg:text-lg py-2 text-dark-purple rounded-none hover:bg-dark-purple/10"
          >
            Cancel
          </button>
          <button
            onClick={onSubmit}
            className="w-full max-w-3/5  bg-dark-purple font-bold text-sm lg:text-lg py-2 rounded-none hover:bg-dark-purple/90 text-white"
          >
            {isPending
              ? "Confirming..."
              : isupdate
              ? `Update appointment £${service.price}`
              : `Confirm appointment £${service.price}`}
          </button>
        </div>

        <p className="text-xs text-red-500 text-center mt-1 sm:mt-4">
          *Please note that appointments can be canceled up to one day in
          advance. Cancellations are not allowed on the day of the appointment.
        </p>
      </DialogContent>
    </Dialog>
  );
};

export default AppointmentConfirmationDialog;

// 🔧 Utility to calculate end time
function calculateEndTime(startTime: string, durationMin: number): string {
  const [time, period] = startTime.trim().split(" ");
  const [rawHour, rawMinute] = time.split(":").map(Number);

  let hour = rawHour;
  if (period.toUpperCase() === "PM" && hour !== 12) hour += 12;
  if (period.toUpperCase() === "AM" && hour === 12) hour = 0;

  const start = new Date();
  start.setHours(hour);
  start.setMinutes(rawMinute);
  start.setSeconds(0);

  const end = new Date(start.getTime() + durationMin * 60 * 1000);
  return format(end, "h:mm a");
}
