"use client";
import HeroAllPage from "@/components/layout/HeroAllPage";
import React, { useEffect, useState } from "react";
import { useSelectedAppointment } from "./store";
import { useGetBarberById } from "../barber/hook.ts/useBarberApi";
import { useGetServices } from "../barber/hook.ts/useSerices";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import BarberSchdule from "../booking/components/BarberSchdule";
import { BarberCardSkeleton } from "../booking/components/BarberCardSkeleton";
import { Service } from "../barber/type";
import Schedule from "../booking/components/Schedule";
import AppointmentConfirmationDialog from "../booking/components/AppointmentConfirmationDialog ";
import { useUpdateAppointment } from "./hooks/useUserAppointment";
import { toast } from "sonner";
import { useSendNotification } from "../booking/useAppointmentNotifcation";
import { useSendEmail } from "@/hook/useSendEmail";
import { convertToDate } from "@/lib/convertTimestamp";
import { redirect } from "next/navigation";

const RescheduleAppointment = () => {
  const { selected, clearSelected } = useSelectedAppointment();
  const { data: barber, isLoading: loadingBarber } = useGetBarberById({
    barberId: selected?.barber.id,
  });
  const [tiemInfo, settiemInfo] = useState<{ date: Date; time: string }>();
  const [isOpenDailog, setisOpenDailog] = useState(false);
  const { data: services, isLoading: loadingServices } = useGetServices();
  const { mutate, isPending } = useUpdateAppointment();
  const [selectedService, setSelectedService] = useState<Service | undefined>(
    selected?.service
  );
  const { mutate: sendNotif } = useSendNotification();
  const { mutate: sendEmail } = useSendEmail();
  const handleUpdate = () => {
    if (!tiemInfo) {
      toast.error("Please select a new date and time.");
      return;
    }

    const oldService = selected?.service.name;
    const newService = selectedService?.name || oldService;

    const oldDate = selected?.date ? convertToDate(selected.date) : new Date();
    const oldStart = selected?.startTime
      ? convertToDate(selected.startTime)
      : new Date();

    const oldTime = `${oldDate.toDateString()} at ${oldStart.toLocaleTimeString(
      [],
      {
        hour: "2-digit",
        minute: "2-digit",
      }
    )}`;

    const newTime = `${tiemInfo.date.toDateString()} at ${tiemInfo.time}`;

    const userName = selected?.user.fullName || "Unknown User";
    const userEmail = selected?.user.email || "";
    const barberName = barber?.fullName || "Unknown Barber";
    const hasServiceChanged = selectedService?.id !== selected?.service.id;
    const hasTimeChanged =
      oldDate.toDateString() !== tiemInfo.date.toDateString() ||
      oldStart.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }) !== tiemInfo.time;

    const serviceSection = hasServiceChanged
      ? `<h3 style="color:#5b2d90;">Service</h3>
        <ul style="margin:0 0 16px 16px;padding:0;">
          <li><strong>Old:</strong> ${oldService}</li>
          <li><strong>New:</strong> ${newService}</li>
        </ul>`
      : "";

    const timeSection = hasTimeChanged
      ? `<h3 style="color:#5b2d90;">Time</h3>
        <ul style="margin:0 0 16px 16px;padding:0;">
          <li><strong>Old:</strong> ${oldTime}</li>
          <li><strong>New:</strong> ${newTime}</li>
        </ul>`
      : "";

    const notifMessageParts: string[] = [];
    if (hasServiceChanged)
      notifMessageParts.push(
        `from <b>${oldService}</b> to <b>${newService}</b>`
      );
    if (hasTimeChanged)
      notifMessageParts.push(`from <b>${oldTime}</b> to <b>${newTime}</b>`);
    const notifMessage = `${userName} rescheduled their appointment ${
      hasServiceChanged ? `from ${oldService} to ${newService}` : ""
    }${hasServiceChanged && hasTimeChanged ? " and " : ""}${
      hasTimeChanged ? `from ${oldTime} to ${newTime}` : ""
    }.`.trim();

    // 📨 Email to system
    sendEmail({
      to: "barbersystem72@gmail.com",
      from: userEmail,
      subject: "Appointment Rescheduled",
      emailUser: userEmail,
      message: "Appointment Rescheduled",
      html: `
        <div style="font-family:Arial;max-width:600px;margin:auto;padding:24px;border:1px solid #e0e0e0;border-radius:8px;">
          <h2 style="color:#5b2d90;border-bottom:2px solid #5b2d90;padding-bottom:8px;">Appointment Rescheduled</h2>
          <p><strong>Client:</strong> ${userName} <span style="font-size:12px;color:#777;">(${userEmail})</span></p>
          <p><strong>Barber:</strong> ${barberName}</p>
          ${serviceSection}
          ${timeSection}
          <p style="font-size:12px;color:#555;margin-top:24px;">If you have any questions, reply to this email.</p>
        </div>
      `,
    });

    // 📨 Email to barber
    sendEmail({
      to: barber?.email || "barber@example.com",
      from: userEmail,
      emailUser: userEmail,
      subject: "Client Rescheduled Appointment",
      message: "Client has rescheduled appointment",
      html: `
        <div style="font-family:Segoe UI,Tahoma,Verdana,sans-serif;max-width:600px;margin:auto;padding:24px;border:1px solid #e0e0e0;border-radius:10px;">
          <h2 style="color:#480024;">✂️ Appointment Rescheduled</h2>
          <p>Hi <strong>${barberName}</strong>,</p>
          <p>Your client <strong>${userName}</strong> <span style="font-size:12px;color:#777;">(${userEmail})</span> has updated their appointment.</p>
          ${serviceSection}
          ${timeSection}
          <p style="margin-top:24px;">Please check your updated schedule.</p>
          <p>Thanks,<br/><strong style="color:#480024;">Barber Booking System</strong></p>
        </div>
      `,
    });

    // 🔔 Send Notification
    sendNotif({
      userId: selected?.user.id || "",
      barberId: barber?.id || "",
      title: "Appointment Rescheduled",
      type: "rescheduled",
      message: notifMessage,
    });

    // 🔁 Update in DB
    mutate(
      {
        id: selected?.id as string,
        updates: {
          service: selectedService,
          date: tiemInfo.date,
          startTime: tiemInfo.time,
        },
      },
      {
        onSuccess: () => {
          toast.success("Successfully rescheduled appointment.");
          clearSelected();
        },
      }
    );
    redirect("/appointments/history");
  };
  useEffect(() => {
    setSelectedService(selected?.service);
  }, [selected]);
  return (
    <div className="space-y-6 sm:mt-12">
      <HeroAllPage
        title="Reschedule Appointment"
        subTitle="You cannot change the barber. Only the service and date can be changed."
      />

      {/* Barber Card */}
      {loadingBarber ? (
        <BarberCardSkeleton />
      ) : (
        barber && (
          <BarberSchdule barber={barber} isSelected={true} onClick={() => {}} />
        )
      )}

      {/* Service Dropdown */}
      {!loadingServices && services && (
        <div>
          <label className="block mb-2 font-medium text-dark-purple text-lg">
            Select a Service
          </label>
          <Select
            value={selectedService?.id}
            defaultValue={selectedService?.id}
            onValueChange={(val) => {
              if (!services) return; // prevent crashing

              const foundService = services.find(
                (service) => service.id === val
              );
              if (foundService) {
                setSelectedService(foundService);
              } else {
                console.warn("No service found for id:", val);
              }
            }}
          >
            <SelectTrigger className="w-full text-lg md:w-[350px] border-2 rounded-none border-dark-purple text-dark-purple">
              <SelectValue placeholder="Choose a service" />
            </SelectTrigger>
            <SelectContent>
              {services.map((service) => (
                <SelectItem
                  className="py-1"
                  key={service.id}
                  value={service.id}
                >
                  {service.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Schedule */}
      {selected && barber && (
        <Schedule
          onConfirm={(e) => {
            setisOpenDailog(true);
            settiemInfo(e);
          }}
          key={selectedService?.name}
          barber={barber}
          service={selectedService ? selectedService : selected.service}
        />
      )}
      {barber && tiemInfo && selected && (
        <AppointmentConfirmationDialog
          barber={barber}
          service={
            selectedService
              ? {
                  duration: selectedService.duration,
                  price: selectedService.price,
                  title: selectedService.name,
                }
              : {
                  duration: selected.service.duration,
                  price: selected.service.price,
                  title: selected.service.name,
                }
          }
          open={isOpenDailog}
          isPending={isPending}
          onSubmit={() => {
            handleUpdate();
          }}
          onClose={() => setisOpenDailog(false)}
          datetime={tiemInfo}
          isupdate
        />
      )}
    </div>
  );
};

export default RescheduleAppointment;
