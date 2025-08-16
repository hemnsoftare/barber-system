"use client";
import React, { useState } from "react";
import { useGetBarbers } from "@/feature-modules/barber/hook.ts/useBarberApi";
import { useGetServices } from "@/feature-modules/barber/hook.ts/useSerices";
import { format, addDays } from "date-fns";
import {
  useCancelAppointment,
  useFilteredAppointments,
  useUpdateAppointmentStatus,
} from "../hook/useAppointment";
import { AppointmentProps, FilterOptions } from "../action/action";
import HeaderAppointmentFilter from "./HeaderAppoiemtnFilter";
import { Timestamp } from "firebase/firestore";
import { toast } from "sonner";
import { useSendEmail } from "@/hook/useSendEmail";
import { useSendNotification } from "../hook/useAppointmentNotifcation";
import { useSelectedAppointment } from "@/feature-modules/users/action/store";
import dayjs, { LOCAL_TZ } from "@/lib/dayjs"; // assuming your custom wrapper
import Tabs from "./Tabs";
import AppointmentsTableDashboard from "./Table";
import AppointmentCalender from "./AppointmentCalender";
const AppointmentTable = ({
  role,
  userId,
}: {
  role: "admin" | "barber";
  userId: string;
}) => {
  const { mutate: cancelAppointment } = useCancelAppointment();
  const { data: barbers } = useGetBarbers();
  const { data: services } = useGetServices();
  const { mutate } = useUpdateAppointmentStatus();
  const [tabs, setTabs] = useState<
    "not-finished" | "finished" | "all" | "expired" | "cancelled"
  >("all");
  const [currentDate, setCurrentDate] = useState(new Date());
  const [filters, setFilters] = useState<FilterOptions>({
    barberId: "All",
    serviceId: "All",
    from: format(new Date(), "yyyy-MM-dd"),
    to: format(new Date(), "yyyy-MM-dd"),
  });
  const {
    data: appointments,
    isLoading,
    error,
  } = useFilteredAppointments({
    filters: {
      from: filters.from,
      to: filters.to,
      barberId: role === "barber" ? userId : filters.barberId,
      serviceId: filters.serviceId,
    },
  });
  const { setSelected } = useSelectedAppointment();

  const handleFilterChange = (key: keyof FilterOptions, value: string) => {
    if (role === "barber" && key === "barberId") {
      value = userId; // Ensure barberId is always the logged-in barber's ID
    }
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleTodayClick = () => {
    const now = dayjs().tz(LOCAL_TZ);
    const todayStr = now.format("YYYY-MM-DD");

    setCurrentDate(now.toDate());
    setFilters((prev) => ({
      ...prev,
      from: todayStr,
      to: todayStr,
    }));
  };

  const handleNextDay = () => {
    const next = addDays(currentDate, 1);
    const nextStr = format(next, "yyyy-MM-dd");
    setCurrentDate(next);
    setFilters((prev) => ({ ...prev, from: nextStr, to: nextStr }));
  };

  const handlePrevDay = () => {
    const prev = addDays(currentDate, -1);
    const prevStr = format(prev, "yyyy-MM-dd");
    setCurrentDate(prev);
    setFilters((prev) => ({ ...prev, from: prevStr, to: prevStr }));
  };
  const { mutate: sendNotification } = useSendNotification();
  const { mutate: sendEmail } = useSendEmail();

  const handleCancel = (appointment: AppointmentProps) => {
    if (!appointment?.id) return;
    appointments?.map((app) => {
      if (app.id === appointment.id) {
        app.status = "cancelled";
      }
      return appointment;
    });
    cancelAppointment(appointment.id, {
      onSuccess: () => {
        toast.success("Appointment cancelled.");

        // 🔔 Send Notifications
        sendNotification({
          userId: appointment.user.id || "",
          barberId: appointment.barber.id,
          type: "cancelled-admin",
          title: "Appointment Cancelled",
          message: `Your appointment on ${
            appointment.date && formatDate(appointment.date)
          } at ${
            appointment.startTime && formatTime(appointment.startTime)
          } has been cancelled.`,
        });

        // 📧 Email to User
        sendEmail({
          to: appointment.user.email || "",
          from: "noreply@barbersystem.com",
          subject: "Your Appointment Was Cancelled",
          emailUser: appointment.user.email || "",
          message: "Cancellation notice",
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 24px; border: 1px solid #e0e0e0; border-radius: 10px; background-color: #fff;">
              <h2 style="color: #b00020; border-bottom: 2px solid #b00020; padding-bottom: 8px;">
                Appointment Cancelled
              </h2>
        
              <p style="font-size: 16px; margin: 16px 0;">
                Hello <strong>${appointment.user.fullName}</strong>,
              </p>
        
              <p style="font-size: 15px; margin: 16px 0;">
                We regret to inform you that your appointment has been <strong style="color:#b00020;">cancelled</strong>.
              </p>
        
              <table style="width: 100%; font-size: 14px; margin-bottom: 24px;">
                <tr>
                  <td style="padding: 8px 0;"><strong>Service:</strong></td>
                  <td>${appointment.service?.name || "N/A"}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0;"><strong>Date:</strong></td>
                  <td>${
                    appointment.date ? formatDate(appointment.date) : "N/A"
                  }</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0;"><strong>Time:</strong></td>
                  <td>${
                    appointment.startTime
                      ? formatTime(appointment.startTime)
                      : "N/A"
                  }</td>
                </tr>
              </table>
        
              <p style="font-size: 14px; color: #555;">
                If this was a mistake or you wish to reschedule, please contact our support team.
              </p>
        
              <p style="margin-top: 24px; font-size: 14px;">
                Best regards,<br/>
                <strong>Barber Booking System</strong>
              </p>
            </div>
          `,
        });

        // 📧 Email to Barber
        sendEmail({
          to: appointment.barber.barberEmail || "",
          from: "noreply@barbersystem.com",
          subject: "Client Cancelled Appointment",
          emailUser: appointment.user.email || "",
          message: "Cancellation by client",
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 24px; border: 1px solid #e0e0e0; border-radius: 10px; background-color: #fff;">
              <h2 style="color: #b00020; border-bottom: 2px solid #b00020; padding-bottom: 8px;">
                Client Cancelled Appointment
              </h2>
        
              <p style="font-size: 16px; margin: 16px 0;">
                Hello <strong>${appointment.barber.fullName}</strong>,
              </p>
        
              <p style="font-size: 15px; margin: 16px 0;">
                Your client <strong>${
                  appointment.user.fullName
                }</strong> has <strong style="color:#b00020;">cancelled</strong> their appointment.
              </p>
        
              <table style="width: 100%; font-size: 14px; margin-bottom: 24px;">
                <tr>
                  <td style="padding: 8px 0;"><strong>Service:</strong></td>
                  <td>${appointment.service?.name || "N/A"}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0;"><strong>Date:</strong></td>
                  <td>${
                    appointment.date ? formatDate(appointment.date) : "N/A"
                  }</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0;"><strong>Time:</strong></td>
                  <td>${
                    appointment.startTime
                      ? formatTime(appointment.startTime)
                      : "N/A"
                  }</td>
                </tr>
              </table>
        
              <p style="font-size: 14px; color: #555;">
                Please update your schedule accordingly.
              </p>
        
              <p style="margin-top: 24px; font-size: 14px;">
                Regards,<br/>
                <strong>Barber Booking System</strong>
              </p>
            </div>
          `,
        });
      },
    });
  };

  //n
  //
  return (
    <div>
      <HeaderAppointmentFilter
        filters={filters}
        barbers={barbers ?? []}
        services={services ?? []}
        currentDate={currentDate}
        handleFilterChange={handleFilterChange}
        handleTodayClick={handleTodayClick}
        handleNextDay={handleNextDay}
        handlePrevDay={handlePrevDay}
      />

      <Tabs
        options={["all", "not-finished", "finished", "expired", "cancelled"]}
        activeTab={tabs}
        onChange={(t) => {
          console.log(t);
          setTabs(t);
        }}
      />
      {/* Table */}
      {2 === 2 ? (
        <AppointmentCalender
          filters={{
            barberId: filters?.barberId as string,
            serviceId: filters?.serviceId as string,
            from: filters.from,
            to: filters.to,
          }}
          appointments={appointments}
          barbers={barbers}
          handleCancel={handleCancel}
          handleFilterChange={handleFilterChange}
          isLoading={isLoading}
          mutate={mutate}
          role={role}
          services={services}
          tabs={tabs}
          error={{ message: error?.message || "" }}
        />
      ) : (
        <AppointmentsTableDashboard
          filters={{
            barberId: filters?.barberId as string,
            serviceId: filters?.serviceId as string,
          }}
          appointments={appointments}
          barbers={barbers}
          handleCancel={handleCancel}
          handleFilterChange={handleFilterChange}
          isLoading={isLoading}
          mutate={mutate}
          role={role}
          services={services}
          setSelected={setSelected}
          tabs={tabs}
          error={{ message: error?.message || "" }}
        />
      )}
    </div>
  );
};

export default AppointmentTable;
const formatDate = (timestamp: Timestamp): string => {
  if (!timestamp?.seconds) return "Invalid date";
  const date = new Date(timestamp.seconds * 1000);
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
};

const formatTime = (timestamp: Timestamp): string => {
  if (!timestamp?.seconds) return "Invalid time";
  const date = new Date(timestamp.seconds * 1000);
  return date.toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};
