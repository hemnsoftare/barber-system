"use client";
import React, { useState } from "react";
import { convertToDate } from "@/lib/convertTimestamp";
import {
  useFilteredAppointments,
  useUpdateAppointmentRemiander,
  useUpdateAppointmentStatus,
} from "../booking/useAppointment";
import { AppointmentProps } from "../booking/action";
import dayjs, { LOCAL_TZ } from "@/lib/dayjs";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import TiltleDashboardPages from "./component/TiltleDashboardPages";
import { useSendEmail } from "@/hook/useSendEmail";
import { useSendNotification } from "../booking/useAppointmentNotifcation";

const MAIN_COLOR = "#480024";

const ReminderPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"reminder" | "expired">(
    "reminder"
  );

  const now = dayjs().tz(LOCAL_TZ);
  const todayString = now.format("YYYY-MM-DD");
  const nextDayString = now.add(1, "day").format("YYYY-MM-DD");

  const { data: todayAppointments, isLoading: todayLoading } =
    useFilteredAppointments({
      filters: {
        from: todayString,
        to: todayString,
        status: "not-finished",
        // sentReminder: "send",
        barberId: "All",
        serviceId: "All",
      },
      enable: activeTab === "reminder",
    });

  const {
    data: nextDayAppointments,
    isLoading: nextDayLoading,
    error: nextd,
  } = useFilteredAppointments({
    filters: {
      from: nextDayString,
      to: nextDayString,
      status: "not-finished",
      // sentReminder: "send",
      barberId: "All",
      serviceId: "All",
    },
    enable: activeTab === "reminder",
  });
  if (!nextDayLoading) {
    console.log(nextDayAppointments);
    console.log(nextd);
  }
  const {
    data: expiredAppointments,
    isLoading: expiredLoading,
    error: expiredError,
  } = useFilteredAppointments({
    filters: {
      from: "2023-01-01",
      to: now.subtract(1, "day").format("YYYY-MM-DD"),
      status: "not-finished",
      barberId: "All",
      serviceId: "All",
    },
    enable: activeTab === "expired",
  });

  const { mutate: sendEmail, isPending } = useSendEmail();
  const { mutate: sendNotu, isPending: notiPending } = useSendNotification();
  const { mutate, isPending: updateAppoientmentPending } =
    useUpdateAppointmentRemiander();
  const { mutate: updateStatus, isPending: updateStatusPending } =
    useUpdateAppointmentStatus();
  const handleSendTodayReminders = () => {
    todayAppointments?.map((app) => {
      mutate({ id: app.id || "" });
      if (
        app.user.email &&
        app?.user?.email?.length > 4 &&
        app.sentReminder === false
      ) {
        sendEmail({
          emailUser: app.user.email || "",
          from: "barbersystem72@gmail.com",
          message: "s",
          html: `
  <div style="max-width: 600px; margin: auto; font-family: Arial, sans-serif; border: 1px solid #ddd; border-radius: 10px; padding: 20px; background-color: #f9f9f9;">
    <h2 style="color: #480024; text-align: center;">Appointment Reminder</h2>
    
    <p>Hello ${app.user.fullName || "Valued Client"},</p>
    
    <p>This is a friendly reminder for your upcoming appointment:</p>
    
    <div style="border: 1px solid #ccc; border-radius: 8px; padding: 16px; background-color: #fff;">
      <p><strong>📅 Date:</strong> ${convertToDate(
        app.date
      ).toLocaleDateString()}</p>
      <p><strong>⏰ Time:</strong> ${convertToDate(
        app.startTime
      ).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</p>
      <p><strong>✂️ Service:</strong> ${app.service.name} - ${
            app.service.price
          } £</p>
      <p><strong>💈 Barber:</strong> ${app.barber.fullName}</p>
      <p><strong>Status:</strong> ${app.status}</p>
    </div>
    
    <p style="margin-top: 20px;">If you have any questions or need to reschedule, feel free to reply to this email.</p>

    <p>Thanks for choosing our barbershop!</p>

    <p style="color: #999; font-size: 12px;">This is an automated reminder. Please do not reply to this message directly.</p>
  </div>
`,
          subject: `Appointment Reminder for ${convertToDate(
            app.date
          ).toLocaleDateString()} at ${convertToDate(
            app.startTime
          ).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`,
          to: app.user.email || "",
        });
        sendNotu({
          barberId: "",
          message: `Reminder sent to ${
            app.user.fullName || "Client"
          } for appointment on ${convertToDate(
            app.date
          ).toLocaleDateString()} at ${convertToDate(
            app.startTime
          ).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })} for service ${app.service.name} (${
            app.service.price
          } £). Status: ${app.status}.`,
          title: "Reminder",
          type: "reminder",
          appointmentId: app.id,
          userId: app.user.id || "",
        });
      }
    });
  };
  const handleSendNextDayReminders = () => {
    nextDayAppointments?.map((app) => {
      mutate(
        { id: app.id || "" },
        {
          onSuccess: () => console.log("change re,odader"),
          onError: (e) => console.log("errmr in update remider " + e),
        }
      );
      if (
        app.user.email &&
        app?.user?.email?.length > 4 &&
        app.sentReminder === false
      ) {
        sendEmail(
          {
            emailUser: app.user.email || "",
            from: "barbersystem72@gmail.com",
            message: "s",
            html: `
  <div style="max-width: 600px; margin: auto; font-family: Arial, sans-serif; border: 1px solid #ddd; border-radius: 10px; padding: 20px; background-color: #f9f9f9;">
    <h2 style="color: #480024; text-align: center;">Appointment Reminder</h2>
    
    <p>Hello ${app.user.fullName || "Valued Client"},</p>
    
    <p>This is a friendly reminder for your upcoming appointment:</p>
    
    <div style="border: 1px solid #ccc; border-radius: 8px; padding: 16px; background-color: #fff;">
      <p><strong>📅 Date:</strong> ${convertToDate(
        app.date
      ).toLocaleDateString()}</p>
      <p><strong>⏰ Time:</strong> ${convertToDate(
        app.startTime
      ).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</p>
      <p><strong>✂️ Service:</strong> ${app.service.name} - ${
              app.service.price
            } £</p>
      <p><strong>💈 Barber:</strong> ${app.barber.fullName}</p>
      <p><strong>Status:</strong> ${app.status}</p>
    </div>
    
    <p style="margin-top: 20px;">If you have any questions or need to reschedule, feel free to reply to this email.</p>

    <p>Thanks for choosing our barbershop!</p>

    <p style="color: #999; font-size: 12px;">This is an automated reminder. Please do not reply to this message directly.</p>
  </div>
`,
            subject: `Appointment Reminder for ${convertToDate(
              app.date
            ).toLocaleDateString()} at ${convertToDate(
              app.startTime
            ).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`,
            to: app.user.email || "",
          },
          {
            onSuccess: () => console.log("send email"),
            onError: (e) => console.log("error send eamil" + e),
          }
        );
        sendNotu(
          {
            barberId: "",
            message: `Reminder sent to ${
              app.user.fullName || "Client"
            } for appointment on ${convertToDate(
              app.date
            ).toLocaleDateString()} at ${convertToDate(
              app.startTime
            ).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })} for service ${app.service.name} (${
              app.service.price
            } £). Status: ${app.status}.`,
            title: "Reminder",
            type: "reminder",
            appointmentId: app.id,
            userId: app.user.id || "",
          },
          {
            onSuccess: () => console.log("noti send"),
            onError: (e) => console.log("error send noti" + e),
          }
        );
      }
    });
  };

  const handleExpireAppointments = () => {
    expiredAppointments?.map((app) => {
      updateStatus({ id: app.id || "", status: "expired" });
      console.log(app);
      if (app.user.email && app.user.email.length > 3) {
        sendEmail(
          {
            emailUser: app.user.email || "",
            from: "barbersystem72@gmail.com",
            message: "Your appointment has expired.",
            html: `
  <div style="max-width: 600px; margin: auto; font-family: Arial, sans-serif; border: 1px solid #ddd; border-radius: 10px; padding: 20px; background-color: #fff3f3;">
    <h2 style="color: #480024; text-align: center;">Appointment Status Update</h2>
    
    <p>Hello ${app.user.fullName || "Valued Client"},</p>
    
    <p>We wanted to inform you that the following appointment has been marked as <strong>expired</strong> in our system:</p>
    
    <div style="border: 1px solid #ccc; border-radius: 8px; padding: 16px; background-color: #fff;">
      <p><strong>📅 Date:</strong> ${convertToDate(
        app.date
      ).toLocaleDateString()}</p>
      <p><strong>⏰ Time:</strong> ${convertToDate(
        app.startTime
      ).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</p>
      <p><strong>✂️ Service:</strong> ${app.service.name} - ${
              app.service.price
            } £</p>
      <p><strong>💈 Barber:</strong> ${app.barber.fullName}</p>
      <p><strong>Status:</strong> ${app.status}</p>
    </div>
    
    <p style="margin-top: 20px;">If this is a mistake or you’d like to reschedule, please contact us.</p>

    <p>We’re here whenever you're ready for your next visit ✂️</p>

    <p style="color: #999; font-size: 12px;">This is an automated message. Please do not reply directly.</p>
  </div>
`,
            subject: `Your appointment on ${convertToDate(
              app.date
            ).toLocaleDateString()} has expired`,
            to: app.user.email || "",
          },
          {
            onSuccess: () => console.log("📨 Expired email sent"),
            onError: (e) => console.log("❌ Error sending expired email: " + e),
          }
        );

        sendNotu(
          {
            barberId: "",
            title: "Appointment Expired",
            message: `The appointment with ${
              app.user.fullName || "Client"
            } on ${convertToDate(
              app.date
            ).toLocaleDateString()} at ${convertToDate(
              app.startTime
            ).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })} for ${app.service.name} (${
              app.service.price
            } £) has been marked as expired.`,
            type: "expired",
            appointmentId: app.id,
            userId: app.user.id || "",
          },
          {
            onSuccess: () => console.log("📢 Expired notification sent"),
            onError: (e) =>
              console.log("❌ Error sending expired notification: " + e),
          }
        );
      }
    });
  };

  const renderAppointmentsList = (
    appointments: AppointmentProps[] | undefined
  ): React.ReactNode => {
    if (!appointments || appointments.length === 0)
      return <p className="text-gray-500 italic">No appointments found</p>;
    return (
      <div className="w-full">
        {" "}
        {appointments.map((a) => (
          <div
            key={a.id}
            className="mb-5 border-b-2 last:mb-0 pb-2 last:border-b-0"
          >
            <div className="space-y-1">
              <div className=" w-full items-center justify-between sm:justify-start flex gap-2">
                <strong className=" sm:w-[140px]">Full name:</strong>
                <span>{a.user.fullName || "N/A"}</span>
              </div>
              <div className=" w-full items-center justify-between sm:justify-start flex gap-2">
                <strong className=" sm:w-[140px]">Email:</strong>
                <span>{a.user.email || "N/A"}</span>
              </div>
              <div className=" w-full items-center justify-between sm:justify-start flex gap-2">
                <strong className=" sm:w-[140px]">Service:</strong>
                <span>
                  {a.service.name} - {a.service.price} $
                </span>
              </div>
              <div className=" w-full items-center justify-between sm:justify-start flex gap-2">
                <strong className=" sm:w-[140px]">Barber:</strong>
                <span>{a.barber.fullName}</span>
              </div>
              <div className=" w-full items-center justify-between sm:justify-start flex gap-2">
                <strong className=" sm:w-[140px]">Date:</strong>
                <span>
                  {convertToDate(a.date).toLocaleDateString()} |{" "}
                  <strong className="ml-2">Time:</strong>{" "}
                  {convertToDate(a.startTime).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
              <div className=" w-full items-center justify-between sm:justify-start flex gap-2">
                <strong className=" sm:w-[140px]">Status:</strong>
                <span>{a.status}</span>
              </div>
              <div className=" w-full items-center justify-between sm:justify-start flex gap-2">
                <strong className=" sm:w-[140px]">Reminder Sent:</strong>
                <span>{a.sentReminder ? "Yes" : "No"}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="max-w-5xl mx-auto px-4" style={{ color: MAIN_COLOR }}>
      <TiltleDashboardPages title="Reminder" />

      <div className="flex gap-4 border-b pb-4 my-6">
        <button
          onClick={() => setActiveTab("reminder")}
          className={`px-4 py-2 border-b-2 rounded ${
            activeTab === "reminder" ? "border-[#480024]" : "border-gray-200"
          }`}
        >
          Reminders
        </button>
        <button
          onClick={() => setActiveTab("expired")}
          className={`px-4 py-2 text-dark-purple border-b-2 rounded ${
            activeTab === "expired" ? "border-[#480024]" : "border-gray-200 "
          }`}
        >
          Expired
        </button>
      </div>

      {activeTab === "reminder" && (
        <Accordion type="multiple" className="space-y-4 w-full ">
          <AccordionItem value="today" className="w-full ">
            <AccordionTrigger className="flex w-full text-sm relative justify-between  md:max-w-full items-center sm:text-lg font-semibold">
              <span>Today&apos;s ({todayString})</span>
              <button
                onClick={(e) => {
                  e.stopPropagation(); // prevent accordion toggle
                  handleSendTodayReminders();
                }}
                disabled={
                  todayLoading ||
                  isPending ||
                  notiPending ||
                  updateAppoientmentPending ||
                  nextDayLoading
                }
                className="bg-[#480024] absolute text-[12px] right-8 top-1/4 text-white px-3 py-1.5 sm:text-sm rounded disabled:opacity-50"
              >
                {todayLoading ||
                isPending ||
                notiPending ||
                updateAppoientmentPending ||
                nextDayLoading
                  ? "Loading..."
                  : "Send Reminders"}
              </button>
            </AccordionTrigger>
            <AccordionContent className="bg-purple-50/50 p-4 rounded-lg border border-purple-300">
              {renderAppointmentsList(todayAppointments)}
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="next-day" className="w-full">
            <AccordionTrigger className="flex justify-between relative w-full md:max-w-full items-center text-sm sm:text-lg font-semibold">
              <span>Next Day ({nextDayString})</span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleSendNextDayReminders();
                }}
                disabled={
                  todayLoading ||
                  isPending ||
                  notiPending ||
                  updateAppoientmentPending
                }
                className="bg-[#480024] text-[12px] absolute right-8 top-1/4 text-white px-3 py-1.5 sm:text-sm rounded disabled:opacity-50"
              >
                {todayLoading ||
                isPending ||
                notiPending ||
                updateAppoientmentPending
                  ? "Loading..."
                  : "Send Reminders"}
              </button>
            </AccordionTrigger>
            <AccordionContent className="bg-purple-50/50 p-4 rounded-lg border border-purple-300">
              {renderAppointmentsList(nextDayAppointments)}
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      )}

      {activeTab === "expired" && (
        <div className="bg-red-50 p-4 rounded-lg border border-red-300 mt-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="sm:text-lg text-sm font-semibold">
              Expired Appointments
            </h2>
            <button
              onClick={handleExpireAppointments}
              disabled={expiredLoading}
              className="bg-[#480024] text-white px-2 sm:px-4 sm:py-2 py-1 text-[12px] sm:text-sm rounded disabled:opacity-50"
            >
              {expiredLoading || updateStatusPending
                ? "Loading..."
                : "Process Expired"}
            </button>
          </div>

          {renderAppointmentsList(expiredAppointments)}

          {expiredLoading && (
            <div className="text-center text-gray-500 py-4">
              Loading expired appointments...
            </div>
          )}

          {expiredError && (
            <div className="bg-red-100 border border-red-300 text-red-700 px-4 py-3 rounded mt-4">
              Error loading expired appointments. Please try again.
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ReminderPage;
