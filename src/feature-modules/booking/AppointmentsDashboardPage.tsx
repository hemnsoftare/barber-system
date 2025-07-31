"use client";
import React from "react";
import TiltleDashboardPages from "../dashboard/component/TiltleDashboardPages";
import AppointmentTable from "./components/AppointmentTable";
import { redirect } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { toast } from "sonner";
import { useSelectedAppointment } from "../users/store";
const AppointmentsDashboardPage = () => {
  const { user } = useUser();
  const { clearSelected } = useSelectedAppointment();
  const role = user?.publicMetadata.role as "admin" | "barber";
  return (
    <div>
      <TiltleDashboardPages title="Appointments">
        <button
          onClick={() => {
            if (role === "barber") {
              toast.error("You are not allowed to create appointments");
              return;
            }
            clearSelected();
            redirect("/dashboard/appointments/create");
          }}
          className="bg-dark-purple text-nowrap px-3 md:hover:bg-dark-purple/90 transition-all duration-300 active:scale-95 sm:px-6 py-1 text-white"
        >
          Add Appointment
        </button>
      </TiltleDashboardPages>
      <AppointmentTable role={role} userId={user?.id || ""} />
    </div>
  );
};

export default AppointmentsDashboardPage;
