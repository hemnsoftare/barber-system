"use client";
import React, { useState } from "react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface CancelAppointmentDialogProps {
  serviceName: string;
  barberName: string;
  datetime: Date;
  starttime: Date;
  onCancel: () => void;
}

const CancelAppointmentDialog: React.FC<CancelAppointmentDialogProps> = ({
  serviceName,
  barberName,
  datetime,
  starttime,
  onCancel,
}) => {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild className="w-full">
        <button
          className="text-dark-purple self-center text-nowrap w-full px- py-3 font-semibold  bg-white"
          onClick={() => setOpen(true)}
        >
          Cancel appointment
        </button>
      </DialogTrigger>
      <DialogContent className="w-[320px] sm:w-[430px]">
        <DialogHeader>
          <DialogTitle className="text-center text-lg text-primary font-semibold">
            Cancel appointment
          </DialogTitle>
          <DialogDescription className="text-center text-base">
            Are you sure you want to cancel this appointment?
          </DialogDescription>
        </DialogHeader>

        <div className="border-t space-y-2 pt-4">
          <h4 className="text-sm font-semibold text-primary mb-3">Details</h4>
          <div className="flex justify-between flex-col sm:flex-row text-sm mb-1">
            <span>
              <strong>Service:</strong> {serviceName}
            </span>
            <span>
              <strong>Date:</strong> {datetime.toLocaleDateString()},{" "}
              {starttime.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          </div>
          <div className="text-sm">
            <strong>Barber:</strong> {barberName}
          </div>
        </div>

        <DialogFooter className="flex gap-4 mt-6">
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => setOpen(false)}
          >
            No, Don’t cancel it
          </Button>
          <Button
            className="flex-1 bg-red-600 hover:bg-red-700 text-white"
            onClick={() => {
              onCancel();
              setOpen(false);
            }}
          >
            Yes, Cancel it
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CancelAppointmentDialog;
