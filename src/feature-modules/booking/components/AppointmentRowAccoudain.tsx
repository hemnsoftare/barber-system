"use client";
import React from "react";
import { AppointmentProps } from "../action";
// import { BsThreeDotsVertical } from "react-icons/bs";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuItem,
//   DropdownMenuLabel,
//   DropdownMenuSeparator,
//   DropdownMenuTrigger,
// } from "@/components/ui/dropdown-menu";
import { Icon } from "@/constants/icons";
import { Timestamp } from "firebase/firestore";
import { redirect } from "next/navigation";

type Props = {
  app: AppointmentProps;
  isFinished: boolean;
  handleCancel: (appointment: AppointmentProps) => void;
  setSelected: (a: AppointmentProps) => void;
  mutate: (input: { id: string; status: string }) => void;
  appointments: AppointmentProps[];
  role: "admin" | "barber";
};

const AppointmentRowAccordion = ({
  app,
  isFinished,
  handleCancel,
  role,
  setSelected,
  mutate,
  appointments,
}: Props) => {
  const handleStatusChange = () => {
    mutate({
      id: app.id as string,
      status: isFinished ? "not-finished" : "finished",
    });

    appointments.forEach((appointment) => {
      if (appointment.id === app.id) {
        appointment.status = isFinished ? "not-finished" : "finished";
      }
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "finished":
        return "text-green-600 bg-green-50";
      case "not-finished":
        return "text-blue-600 bg-blue-50";
      case "cancelled":
        return "text-red-600 bg-red-50";
      default:
        return "text-gray-600 bg-gray-50";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "finished":
        return "Finished";
      case "not-finished":
        return "Not finished";
      case "cancelled":
        return "Cancelled";
      default:
        return "Expired";
    }
  };

  return (
    <Accordion
      type="single"
      collapsible
      key={app.id}
      className="w-full lg:hidden mb-0 border  shadow-sm"
    >
      <AccordionItem value="item-1" className="w-full ">
        <AccordionTrigger className="flex items-center sm:max-w-full sm:min-w-full  w-full justify-between px-4 py-3">
          <div className="flex items-center gap-3 w-full">
            <div className="flex-1 sm:gap-1 min-w-0">
              <h3 className="font-medium sm:mb-1 text-sm truncate">
                {app.service?.name}
              </h3>
              <p className="text-xs text-muted-foreground">
                {app.date && formatDate(app.date)},{" "}
                {app.startTime && formatTime(app.startTime)} -{" "}
                {app.startTime &&
                  getEndTime(app.startTime, app.service?.duration || 0)}
              </p>
            </div>

            <span
              className={`px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap ${getStatusColor(
                app.status
              )}`}
            >
              {getStatusText(app.status)}
            </span>
          </div>
        </AccordionTrigger>

        <AccordionContent className="bg-gray-50 px-4 py-4 text-sm space-y-3">
          <Row label="Client" value={app.user?.fullName} />
          <Row label="Barber" value={app.barber?.fullName} />
          <Row label="Service" value={app.service?.name} />
          <Row label="Price" value={`£${app.service?.price}`} />
          <Row
            label="Date & Time"
            value={
              <>
                {app.date && formatDate(app.date)} <br />
                {app.startTime && formatTime(app.startTime)} -{" "}
                {app.startTime &&
                  getEndTime(app.startTime, app.service?.duration || 0)}
              </>
            }
          />

          {/* Checkbox moved here */}
          {app.status !== "finished" && app.status !== "cancelled" && (
            <div className="flex items-center gap-2 pt-2">
              <input
                type="checkbox"
                checked={isFinished}
                onChange={handleStatusChange}
                className="accent-purple-800 w-4 h-4"
              />
              <label className="text-sm">Mark as finished</label>
            </div>
          )}

          {role === "admin" && app.status === "not-finished" && (
            <div className="pt-3 border-t border-gray-200">
              <div className="flex gap-5 justify-end">
                <button
                  onClick={() => handleCancel(app)}
                  className="flex items-center gap-2 px-3 py-2 text-sm border border-red-200 rounded-lg text-red-700 hover:bg-red-50 transition"
                >
                  <Icon name="delete" color="#C00000" /> Cancel
                </button>
                <button
                  onClick={() => {
                    setSelected(app);
                    redirect("/dashboard/appointments/create");
                  }}
                  className="flex items-center gap-2 px-3 py-2 text-sm border border-blue-200 rounded-lg text-blue-700 hover:bg-blue-50 transition"
                >
                  <Icon name="edit" color="blue" /> Edit
                </button>
                {/* <DropdownMenu>
                  <DropdownMenuTrigger className="flex items-center gap-2 px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-white transition">
                    <BsThreeDotsVertical className="w-4 h-4" />
                    Actions
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => handleCancel(app)}>
                      <Icon name="delete" color="#C00000" /> Cancel
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => {
                        setSelected(app);
                        redirect("/dashboard/appointments/create");
                      }}
                    >
                
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu> */}
              </div>
            </div>
          )}
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};

export default AppointmentRowAccordion;

const Row = ({ label, value }: { label: string; value: React.ReactNode }) => (
  <div className="flex justify-between items-start">
    <span className="text-muted-foreground font-medium">{label}:</span>
    <span className="text-right">{value}</span>
  </div>
);

const formatDate = (timestamp: Timestamp): string => {
  const date = new Date(timestamp.seconds * 1000);
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
};

const formatTime = (timestamp: Timestamp): string => {
  const date = new Date(timestamp.seconds * 1000);
  return date.toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};

const getEndTime = (start: Timestamp, duration: number): string => {
  const startDate = new Date(start.seconds * 1000);
  const endDate = new Date(startDate.getTime() + duration * 60000);
  return endDate.toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};
