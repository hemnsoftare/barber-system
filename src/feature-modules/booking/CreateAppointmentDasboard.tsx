"use client";
import React, { useEffect, useState } from "react";
import TiltleDashboardPages from "../dashboard/component/TiltleDashboardPages";
import SelectBarber from "../barber/components/SelectBarber";
import { useGetBarbers } from "../barber/hook.ts/useBarberApi";
import { useGetServices } from "../barber/hook.ts/useSerices";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { Barber, Service } from "../barber/type";
import Schedule from "./components/Schedule";
import AppointmentConfirmationDialog from "./components/AppointmentConfirmationDialog ";
import Input from "@/components/layout/Input";
import { toast } from "sonner";
import { useAddAppointment, useUpdateAppointment } from "./useAppointment";
import { useSendEmail } from "@/hook/useSendEmail";
import { useSendNotification } from "./useAppointmentNotifcation";
import { redirect } from "next/navigation";
import { useSelectedAppointment } from "../users/store";
import { Timestamp } from "firebase/firestore";
const CreateAppointmentDasboard = () => {
  const { data: barbers, isLoading: loadingBarber } = useGetBarbers();
  const [selectBarber, setselectBarber] = useState<Barber | null>(null);
  const [selectedService, setselectedService] = useState<Service>();
  const { data: services, isLoading: loadingServices } = useGetServices();
  const { selected: selectedAppointment } = useSelectedAppointment();
  const [tiemInfo, settiemInfo] = useState<{
    date: Date;
    time: string;
    dayOffWeek:
      | "SUNDAY"
      | "MONDAY"
      | "TUESDAY"
      | "WEDNESDAY"
      | "THURSDAY"
      | "FRIDAY"
      | "SATURDAY";
  }>();
  const [isOpenDailog, setisOpenDailog] = useState(false);
  const [nameUser, setnameUser] = useState<string>();
  const [error, seterror] = useState("");
  const { mutate, isPending } = useAddAppointment();
  const { mutate: sendEmail } = useSendEmail();
  const { mutate: sendNotif } = useSendNotification();
  const handleSubmit = () => {
    if (selectedService && selectBarber && tiemInfo && nameUser) {
      mutate(
        {
          service: selectedService,
          user: {
            id: null,
            fullName: nameUser || "",
            email: null,
          },
          barber: {
            id: selectBarber.id || "",
            fullName: selectBarber.fullName || "",
            profileImage: selectBarber.profileImage || "",
            barberEmail: selectBarber.email || "",
          },
          isBlocked: false,
          isCancelled: false,
          sentReminder: false,
          dayOffWeek: [tiemInfo.dayOffWeek],
          status: "not-finished",
          datetime: tiemInfo,
        },
        {
          onSuccess: () => {
            // ✅ Toast
            setisOpenDailog(false);

            // ✅ Notification
            sendNotif({
              userId: "", // if you want to notify user too
              barberId: selectBarber.id || "",
              title: "New Appointment Booked",
              type: "booked",
              message: `${nameUser} booked a ${
                selectedService.name
              } on ${tiemInfo.date.toDateString()} at ${tiemInfo.time}.`,
            });

            // ✅ Email
            sendEmail({
              to: selectBarber.email || "",
              from: "noreply@barbersystem.com",
              subject: "New Appointment Booked",
              emailUser: selectBarber.email || "",
              message: "You have a new booking!",
              html: `
                <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: auto; padding: 24px; background: #ffffff; border: 1px solid #e0e0e0; border-radius: 10px;">
                  
                  <h2 style="color: #3b0764; font-size: 24px; margin-bottom: 12px; text-align: center;">
                    ✂️ New Appointment Booked
                  </h2>
                  
                  <p style="font-size: 16px; margin-bottom: 10px;">Hi <strong>${
                    selectBarber.fullName
                  }</strong>,</p>
                  
                  <p style="font-size: 15px; color: #555; margin-bottom: 20px;">
                    <strong>${nameUser}</strong> has just booked an appointment for a <strong>${
                selectedService.name
              }</strong>.
                  </p>
            
                  <table style="width: 100%; font-size: 14px; color: #444; margin-bottom: 20px;">
                    <tr>
                      <td style="padding: 8px 0;"><strong>Date:</strong></td>
                      <td>${tiemInfo.date.toDateString()}</td>
                    </tr>
                    <tr>
                      <td style="padding: 8px 0;"><strong>Time:</strong></td>
                      <td>${tiemInfo.time}</td>
                    </tr>
                    <tr>
                      <td style="padding: 8px 0;"><strong>Service:</strong></td>
                      <td>${selectedService.name}</td>
                    </tr>
                  </table>
            
                  <p style="font-size: 14px; margin-bottom: 10px;">
                    Please check your dashboard for more details.
                  </p>
            
                  <p style="font-size: 13px; color: #777;">This is an automated email from the Barber Booking System.</p>
                </div>
              `,
            });
          },
        }
      );
    }
    toast.success("Appointment booked successfully!");
    redirect("/dashboard/appointments");
  };
  const { mutate: updateAppointment, isPending: isUpdating } =
    useUpdateAppointment();

  const handleUpdate = () => {
    console.log("update");
    if (!selectedAppointment) return;
    if (!selectedService || !tiemInfo) {
      return toast.error("Please select a service and time.");
    }

    updateAppointment(
      {
        id: selectedAppointment.id || "",
        updates: {
          service: selectedService,
          datetime: tiemInfo,
          dayOffWeek: [tiemInfo.dayOffWeek],
        },
      },
      {
        onError: (e) => console.error("Update failed:", e),
        onSuccess: () => {
          // Vars
          console.log("aaaaaaaaaaaaaaaaaaaaaaaaaaa");
          const userName = selectedAppointment.user.fullName;
          const userEmail =
            selectedAppointment.user.email || "no-user@email.com";
          const barberName = selectedAppointment.barber.fullName;
          const barberEmail = selectedAppointment.barber.barberEmail || "";

          const oldService = selectedAppointment.service;
          const newService = selectedService;

          const oldDateStr =
            (selectedAppointment.date &&
              formatDate(selectedAppointment.date)) ||
            "";
          const newDateStr = tiemInfo.date.toDateString();

          const oldTimeStr =
            (selectedAppointment.startTime &&
              formatTime(selectedAppointment.startTime)) ||
            "";
          const newTimeStr = tiemInfo.time;

          const recipientNameBarber = barberName;
          const recipientNameUser = userName || "";

          // 🔔 Notify barber
          sendNotif({
            userId: "",
            barberId: selectedAppointment.barber.id,
            title: "Appointment Updated",
            type: "update-appointment",
            message: `${userName} updated their appointment to ${newService.name} on ${newDateStr} at ${newTimeStr}.`,
          });

          // 🔔 Notify user
          sendNotif({
            userId: selectedAppointment?.user?.id || "",
            barberId: "",
            title: "Appointment Updated",
            type: "update-appointment",
            message: `Your appointment with ${barberName} was updated to ${newService.name} on ${newDateStr} at ${newTimeStr}.`,
          });

          // 📧 Email to barber
          sendEmail({
            to: barberEmail,
            from: "noreply@barbersystem.com",
            subject: "Appointment Updated",
            emailUser: barberEmail,
            message: "An appointment has been updated!",
            html: makeFancyEmail({
              recipientName: recipientNameBarber,
              oldService,
              newService,
              oldDateStr,
              newDateStr,
              oldTimeStr,
              newTimeStr,
            }),
          });

          // 📧 Email to user
          sendEmail({
            to: userEmail,
            from: "noreply@barbersystem.com",
            subject: "Your Appointment Updated",
            emailUser: userEmail,
            message: "You've updated your appointment successfully!",
            html: makeFancyEmail({
              recipientName: recipientNameUser,
              oldService,
              newService,
              oldDateStr,
              newDateStr,
              oldTimeStr,
              newTimeStr,
            }),
          });
          toast.success("Appointment updated successfully!");
          redirect("/dashboard/appointments");
        },
      }
    );
  };

  useEffect(() => {
    const currentbarber = barbers?.find(
      (bar) => bar.id === selectedAppointment?.barber.id
    );
    if (currentbarber) setselectBarber(currentbarber);
    setselectedService(selectedAppointment?.service);
    setnameUser(selectedAppointment?.user.fullName || "");
  }, [selectedAppointment, barbers, services]);
  return (
    <div>
      <TiltleDashboardPages
        title={
          selectedAppointment === null
            ? "Create Appointment"
            : "Update Appointment"
        }
        showBackBotton
      />
      <div className="w-full mt-24 flex flex-col  ">
        <Input
          label="Enter Name Client"
          onChange={(e) => setnameUser(e.target.value)}
          error={error}
          placeholder="enter name client"
          className="w-full  md:w-[300px]"
          icon="user"
          disabled={selectedAppointment !== null}
          defaultData={selectedAppointment?.user.fullName || ""}
        />
        <br />
        {
          <SelectBarber
            barbers={
              barbers
                ?.filter((item) => typeof item.id === "string")
                .map((item) => ({
                  name: item.fullName,
                  id: item.id as string,
                })) ?? []
            }
            des={!!selectedAppointment}
            selectedBarberId={selectBarber?.id}
            isLoading={loadingBarber}
            onChange={(e) => {
              if (!barbers) return; // prevent crashing

              const foundService = barbers.find((service) => service.id === e);
              if (foundService) {
                setselectBarber(foundService);
              } else {
                console.warn("No service found for id:", e);
              }
            }}
          />
        }
        <label className="block mt-12  font-medium text-dark-purple text-lg">
          Select a Service
        </label>
        <Select
          value={selectedService?.id}
          onValueChange={(val) => {
            if (!services) return; // prevent crashing

            const foundService = services.find((service) => service.id === val);
            if (foundService) {
              setselectedService(foundService);
            } else {
              console.warn("No service found for id:", val);
            }
          }}
        >
          <SelectTrigger className="md:w-[300px] w-full  border-2 rounded-none border-dark-purple text-dark-purple">
            <SelectValue
              placeholder={loadingServices ? "loading ..." : "Choose a service"}
            />
          </SelectTrigger>
          <SelectContent>
            {services?.map((service) => (
              <SelectItem key={service.id} value={service.id}>
                {service.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <label className="block mt-12 -mb-6 font-medium text-dark-purple text-lg">
          Select a time
        </label>
        {selectedAppointment?.date && selectedAppointment.startTime && (
          <p className="mt-6">
            {formatDate(selectedAppointment?.date)} -{" "}
            {formatTime(selectedAppointment.startTime)}
            {" : "}{" "}
            {getEndTime(
              selectedAppointment.startTime,
              selectedAppointment.service.duration
            )}
          </p>
        )}
        {selectBarber && selectedService ? (
          <Schedule
            key={`${selectBarber.id} - ${selectedService.id} `}
            barber={selectBarber}
            service={selectedService}
            onConfirm={(e) => {
              if (nameUser) {
                settiemInfo(e);

                setisOpenDailog(true);
              } else {
                seterror("Name is required to proceed with booking.");
                toast.error("Please enter your name first.", {
                  description: "Name is required to proceed with booking.",
                  style: {
                    backgroundColor: "#fee2e2", // light red
                    color: "#b91c1c", // dark red text
                    border: "1px solid #fca5a5", // red border
                    padding: "12px 16px",
                    borderRadius: "6px",
                  },
                });
              }
            }}
          />
        ) : (
          <p className="text-error mt-6 ">Please select barber and service </p>
        )}
        {selectBarber && tiemInfo && selectedService && (
          <AppointmentConfirmationDialog
            barber={selectBarber}
            datetime={tiemInfo}
            onClose={() => setisOpenDailog(false)}
            onSubmit={selectedAppointment ? handleUpdate : handleSubmit}
            open={isOpenDailog}
            service={{
              duration: selectedService.duration,
              price: selectedService.price,
              title: selectedService.name,
            }}
            nameUser={nameUser}
            isPending={isPending || isUpdating}
          />
        )}
      </div>
    </div>
  );
};

export default CreateAppointmentDasboard;

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

const getEndTime = (
  startTimestamp: Timestamp,
  durationMinutes: number
): string => {
  if (!startTimestamp?.seconds) return "Invalid end time";
  const startDate = new Date(startTimestamp.seconds * 1000);
  const endDate = new Date(startDate.getTime() + durationMinutes * 60000);
  return endDate.toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};
type EmailVars = {
  recipientName: string;
  oldService: { name: string };
  newService: { name: string };
  oldDateStr: string;
  newDateStr: string;
  oldTimeStr: string;
  newTimeStr: string;
};

function makeFancyEmail(v: EmailVars): string {
  const changed = (label: string, oldVal: string, newVal: string) =>
    oldVal !== newVal
      ? `<tr>
          <td style="padding: 8px;">${label}</td>
          <td style="padding: 8px;">${oldVal}</td>
          <td style="padding: 8px;">${newVal}</td>
        </tr>`
      : "";

  return `
    <div style="font-family:'Segoe UI',Tahoma,sans-serif;background:#f8f8ff;padding:24px;max-width:600px;margin:auto;border-radius:10px;border:1px solid #ddd;">
      <h2 style="color:#7c3aed;text-align:center;">✂️ Appointment Updated</h2>
      <p style="font-size:16px;color:#333;">Hello <strong>${
        v.recipientName
      }</strong>,</p>
      <p style="font-size:15px;color:#444;">Your appointment has been <strong>successfully updated</strong>. Here's what changed:</p>
      <table style="width:100%;margin-top:16px;font-size:14px;border-collapse:collapse;">
        <thead>
          <tr style="background:#eee;">
            <th style="padding:8px;text-align:left;">Field</th>
            <th style="padding:8px;text-align:left;">Old</th>
            <th style="padding:8px;text-align:left;">New</th>
          </tr>
        </thead>
        <tbody>
          ${changed("Service", v.oldService.name, v.newService.name)}
          ${changed("Date", v.oldDateStr, v.newDateStr)}
          ${changed("Time", v.oldTimeStr, v.newTimeStr)}
        </tbody>
      </table>
      <p style="font-size:14px;color:#555;margin-top:24px;">You can check your dashboard for full appointment history.</p>
      <div style="margin-top:32px;text-align:center;">
        <a href="https://yourapp.com/dashboard" style="background:#7c3aed;color:white;padding:10px 20px;border-radius:6px;text-decoration:none;">Go to Dashboard</a>
      </div>
      <p style="font-size:12px;color:#aaa;text-align:center;margin-top:32px;">This is an automated message from the Barber Booking System.</p>
    </div>`;
}
