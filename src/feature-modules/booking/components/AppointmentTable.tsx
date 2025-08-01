"use client";
import React, { useState } from "react";
import { useGetBarbers } from "@/feature-modules/barber/hook.ts/useBarberApi";
import { useGetServices } from "@/feature-modules/barber/hook.ts/useSerices";
import { format, addDays } from "date-fns";
import {
  useCancelAppointment,
  useFilteredAppointments,
  useUpdateAppointmentStatus,
} from "../useAppointment";
import { AppointmentProps, FilterOptions } from "../action";
import HeaderAppointmentFilter from "./HeaderAppoiemtnFilter";
import THeadAppointment from "./THeadAppointment";
// import { BsThreeDotsVertical } from "react-icons/bs";
// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuItem,
//   DropdownMenuLabel,
//   DropdownMenuSeparator,
//   DropdownMenuTrigger,
// } from "@/components/ui/dropdown-menu";
// import { Icon } from "@/constants/icons";
import { Timestamp } from "firebase/firestore";
import { toast } from "sonner";
import { useSendEmail } from "@/hook/useSendEmail";
import { useSendNotification } from "../useAppointmentNotifcation";
import { useSelectedAppointment } from "@/feature-modules/users/store";
import dayjs, { LOCAL_TZ } from "@/lib/dayjs"; // assuming your custom wrapper
import AppointmentRow from "./AppointmentRow";
import AppointmentRowAccourdain from "./AppointmentRowAccoudain";
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
  console.log(role === "barber" ? userId : filters.barberId);
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
  if (!isLoading) {
    console.log("Appointments: ", appointments);
    console.log(appointments);
  } ///
  //n
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

      {/* Tabs */}
      <div className="flex overflow-x-auto gap-4 mt-16">
        {["all", "not-finished", "finished", "expired", "cancelled"].map(
          (tab) => (
            <button
              key={tab}
              className={`text-dark-purple text-nowrap text-[16px] font-semibold ${
                tabs === tab ? "border-b-2 border-dark-purple" : ""
              }`}
              onClick={() => setTabs(tab as typeof tabs)}
            >
              {tab
                .replace("-", " ")
                .replace(/\b\w/g, (char) => char.toUpperCase())}
            </button>
          )
        )}
      </div>
      {/* Table */}
      <table className="w-full bg-white mt-6  border text-sm">
        <THeadAppointment
          filters={{
            barberId: filters?.barberId as string,
            serviceId: filters?.serviceId as string,
          }}
          role={role}
          barbers={barbers ?? []}
          services={services ?? []}
          handleFilterChange={handleFilterChange}
        />
        <tbody>
          {isLoading ? (
            <tr>
              <td colSpan={7} className="p-3 text-left">
                Loading...
              </td>
            </tr>
          ) : error ? (
            <tr>
              <td colSpan={7} className="p-3 text-center text-red-500">
                {error.message}
              </td>
            </tr>
          ) : appointments?.length === 0 ? (
            <tr>
              <td colSpan={7} className="p-3 text-center">
                No appointments found.
              </td>
            </tr>
          ) : null}

          {appointments
            ?.filter((app) => {
              const date = app.date?.toDate?.();
              const isFinished = app.status === "finished";
              const isCancelled = app.status === "cancelled";
              const isNotFinished = app.status === "not-finished";
              const isExpired =
                date && !isFinished && !isCancelled
                  ? date.getTime() < Date.now()
                  : false;

              if (tabs === "all") return true;
              if (tabs === "finished") return isFinished;
              if (tabs === "not-finished") return isNotFinished;
              if (tabs === "cancelled") return isCancelled;
              if (tabs === "expired") return isExpired;

              return false;
            })
            .sort((a, b) => {
              const timeA = a.startTime?.seconds || 0;
              const timeB = b.startTime?.seconds || 0;
              return timeA - timeB;
            })
            .map((app) => {
              const isFinished = app.status === "finished";

              return (
                <>
                  <AppointmentRowAccourdain
                    key={`accordion-${app.id}`}
                    role={role}
                    app={app}
                    isFinished={isFinished}
                    handleCancel={handleCancel}
                    setSelected={setSelected}
                    mutate={(e) => {
                      mutate({
                        id: e.id as string,
                        status: isFinished ? "not-finished" : "finished",
                      });

                      // Local update
                      appointments.map((appointment) => {
                        if (appointment.id === e.id) {
                          appointment.status = isFinished
                            ? "not-finished"
                            : "finished";
                        }
                        return appointment;
                      });
                    }}
                    appointments={appointments}
                  />
                  <AppointmentRow
                    key={`row-${app.id}`}
                    app={app}
                    role={role}
                    isFinished={isFinished}
                    handleCancel={handleCancel}
                    setSelected={setSelected}
                    mutate={(e) => {
                      mutate({
                        id: e.id as string,
                        status: isFinished ? "not-finished" : "finished",
                      });

                      // Local update
                      appointments.map((appointment) => {
                        if (appointment.id === e.id) {
                          appointment.status = isFinished
                            ? "not-finished"
                            : "finished";
                        }
                        return appointment;
                      });
                    }}
                    appointments={appointments}
                  />
                </>
              );
            })}
        </tbody>
      </table>
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
{
  /* <tr key={app.id} className="border-t hover:bg-gray-50">
                  <td className="p-3">{app.user?.fullName}</td>
                  <td className="p-3">{app.service?.name}</td>
                  <td className="p-3 uppercase">
                    {app.date && formatDate(app.date)} ,{" "}
                    {app.startTime && formatTime(app.startTime)}
                    {" - "}
                    {app.startTime &&
                      getEndTime(app.startTime, app.service.duration)}
                  </td>
                  <td className="p-3">{app.barber?.fullName}</td>
                  <td className="p-3">£{app.service?.price}</td>
                  <td className="p-3 flex items-center gap-2">
                    {app.status !== "finished" &&
                      app.status !== "cancelled" && (
                        <input
                          type="checkbox"
                          checked={isFinished}
                          onChange={() => {
                            mutate({
                              id: app.id as string,
                              status: isFinished ? "not-finished" : "finished",
                            });

                            // Optionally, you can also update the local state or refetch data
                            appointments.map((appointment) => {
                              if (appointment.id === app.id) {
                                appointment.status = isFinished
                                  ? "not-finished"
                                  : "finished";
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
                        ? "Caneclled"
                        : "Expired"}
                    </span>
                  </td>
                  <td className="p-3 text-center">
                    <DropdownMenu>
                      <DropdownMenuTrigger
                        disabled={app.status !== "not-finished"}
                        className="text-gray-500 disabled:bg-dark-purple/20 rounded-full p-1 hover:text-gray-800 transition"
                      >
                        <BsThreeDotsVertical className="w-5 h-5" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuLabel> Actions</DropdownMenuLabel>
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
                        {/* <DropdownMenuItem>Subscription</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
                         */
}
// const getEndTime = (
//   startTimestamp: Timestamp,
//   durationMinutes: number
// ): string => {
//   if (!startTimestamp?.seconds) return "Invalid end time";
//   const startDate = new Date(startTimestamp.seconds * 1000);
//   const endDate = new Date(startDate.getTime() + durationMinutes * 60000);
//   return endDate.toLocaleTimeString("en-GB", {
//     hour: "2-digit",
//     minute: "2-digit",
//     hour12: true,
//   });
// };
