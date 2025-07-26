// components/appointments/AppointmentRow.tsx
"use client";
import React from "react";
import { AppointmentProps } from "../action";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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

const AppointmentRow = ({
  app,
  isFinished,
  handleCancel,
  setSelected,
  mutate,
  appointments,
  role,
}: Props) => {
  return (
    <tr key={app.id} className="border-t hidden lg:table-row hover:bg-gray-50">
      <td className="p-3">{app.user?.fullName}</td>
      <td className="p-3">{app.service?.name}</td>
      <td className="p-3 uppercase">
        {app.date && formatDate(app.date)} ,{" "}
        {app.startTime && formatTime(app.startTime)} -{" "}
        {app.startTime && getEndTime(app.startTime, app.service?.duration || 0)}
      </td>
      <td className="p-3">{app.barber?.fullName}</td>
      <td className="p-3">£{app.service?.price}</td>
      <td className="p-3 flex items-center gap-2">
        {app.status !== "finished" && app.status !== "cancelled" && (
          <input
            type="checkbox"
            checked={isFinished}
            onChange={() => {
              mutate({
                id: app.id as string,
                status: isFinished ? "not-finished" : "finished",
              });

              appointments.map((appointment) => {
                if (appointment.id === app.id) {
                  appointment.status = isFinished ? "not-finished" : "finished";
                }
                return appointment;
              });
            }}
            className="accent-purple-800"
          />
        )}
        <span>
          {app.status === "finished"
            ? "Finished"
            : app.status === "not-finished"
            ? "Not finished"
            : app.status === "cancelled"
            ? "Cancelled"
            : "Expired"}
        </span>
      </td>
      <td hidden={role === "barber"} className="p-3 text-center">
        <DropdownMenu>
          <DropdownMenuTrigger
            disabled={app.status !== "not-finished"}
            className="text-gray-500 disabled:bg-dark-purple/20 rounded-full p-1 hover:text-gray-800 transition"
          >
            <p>Actions</p>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
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
              <Icon name="edit" color="blue" /> Edit
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </td>
    </tr>
  );
};

export default AppointmentRow;

// Utility functions
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
