"use client";
import HeroAllPage from "@/components/layout/HeroAllPage";
import { Icon } from "@/constants/icons";
import React, { useState } from "react";
import { useSelectedBarber, useSelectedService } from "./store";
import ServiceCard from "./components/ServiceCardSchdule";
import { useGetBarbers } from "../barber/hook.ts/useBarberApi";
import BarberSchdule from "./components/BarberSchdule";
import BarberSelectionPage from "./components/BarberCardSkeleton";
import AppointmentConfirmationDialog from "./components/AppointmentConfirmationDialog ";
import { redirect } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { useAddAppointment } from "./useAppointment";
import { toast } from "sonner";
import { useSendNotification } from "./useAppointmentNotifcation";
import { useSendEmail } from "@/hook/useSendEmail";
import Schedule from "./components/Schedule";
const SchedulePageUser = () => {
  const { user } = useUser();
  const { selected } = useSelectedService();
  const { data, isLoading } = useGetBarbers();
  const { selected: selectBarber, toggleSelected: toggleSelectedBarber } =
    useSelectedBarber();
  const [isOpenDailog, setisOpenDailog] = useState(false);
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
  const { mutate, isPending } = useAddAppointment();
  const { mutate: sendNotif } = useSendNotification();
  const { mutate: sendEmail } = useSendEmail();
  const handleSubmit = () => {
    // Handle the submission logic here
    if (selected && selectBarber && tiemInfo && user) {
      mutate(
        {
          service: selected,
          user: {
            id: user.id,
            fullName: user.fullName || "",
            email: user.emailAddresses[0].emailAddress || "",
          },
          totalBookings: selectBarber.totalBookings || 0,
          barber: {
            id: selectBarber.id || "",
            fullName: selectBarber.fullName || "",
            profileImage: selectBarber.profileImage || "",
            barberEmail: selectBarber.email || "", // Ensure barber has an email field
          },
          isBlocked: false,
          isCancelled: false,
          sentReminder: false,
          // startTime: tiemInfo?.time,
          dayOffWeek: [tiemInfo.dayOffWeek],
          status: "not-finished",
          datetime: tiemInfo,
          // date: tiemInfo.date.toISOString().split("T")[0],
        },
        { onSuccess: () => toast.success("Appointment booked successfully!") }
      );
      sendNotif(
        {
          userId: user?.id,
          barberId: selectBarber.id as string,
          message: `${user.fullName} booked "${selected.name}" with ${
            selectBarber.fullName
          } on ${tiemInfo?.date.toDateString()} at ${tiemInfo?.time}.`,
          title: "New Appointment",
          type: "booked",
        },
        {
          onSuccess: () => {
            toast.success("Notification sent successfully!");
          },
          onError: (error) => {
            console.error("error sending notification:", error);
            toast.error("Failed to send notification: " + error.message);
          },
        }
      );
      sendEmail(
        {
          to: "barbersystem72@gmail.com", // this email receives booking notice
          from: user.emailAddresses[0].emailAddress, // user's actual email
          subject: "New Booking Submitted",
          message: `${user.fullName} booked "${
            selected.name
          }" on ${tiemInfo?.date.toDateString()} at ${tiemInfo?.time}.`,
          emailUser: user.emailAddresses[0].emailAddress, // user's email for reply
        },
        {
          onSuccess: () => {
            console.log("System received booking email");
          },
          onError: (error) => {
            console.error("Error sending system booking email:", error);
          },
        }
      );

      // THEN send another to the barber:
      sendEmail(
        {
          to: selectBarber.email, // make sure barber has an email field
          from: "barbersystem72@gmail.com",
          subject: "You Have a New Appointment",
          message: `Hi ${selectBarber.fullName},\n\n${
            user.fullName
          } just booked "${
            selected.name
          }" for ${tiemInfo?.date.toDateString()} at ${tiemInfo?.time}.`,
          emailUser: user.emailAddresses[0].emailAddress, // user's email for reply
        },
        {
          onSuccess: () => {
            toast.success("Barber notified via email!");
          },
          onError: (error) => {
            console.error("Error sending email to barber:", error);
            toast.error("Failed to notify barber: " + error.message);
          },
        }
      );
    } else {
      if (!selected) {
        toast.error("Please select a service.");
      } else if (!selectBarber) {
        toast.error("Please select a barber.");
      } else if (!tiemInfo) {
        toast.error("Please select a time.");
      } else if (!user) {
        toast.error("User information is missing.");
      }
    }
  };

  return (
    <div>
      <HeroAllPage
        image="/images/aboutushero.png"
        title="BOOK AN APPOINTMENT"
        subTitle="Select Barber & Time"
      />
      <div className="flex flex-col lg:flex-row  mt-8 lg:mt-16 gap-4  items-center ">
        <div
          onClick={() => redirect("/booking/services")}
          className="flex w-full self-start lg:self-auto sm:w-fit items-center text-xl text-[#252525] gap-3"
        >
          <Icon name="next" className="rotate-180" />
          <span>Back to picking a service</span>
        </div>
        {selected && <ServiceCard item={selected} />}
      </div>
      <div className="mt-12 overflow-x-auto">
        <h1 className="text-dark-purple text-xl">Select a barber</h1>
        <div className="flex items-center gap-4">
          {isLoading ? (
            <BarberSelectionPage />
          ) : (
            data &&
            data?.map((barber) => (
              <BarberSchdule
                key={barber.id}
                barber={barber}
                isSelected={barber.id === selectBarber?.id}
                onClick={() => toggleSelectedBarber(barber)}
              />
            ))
          )}
        </div>
      </div>

      {/* time select */}
      <div className="mt-12 w-full">
        <h1 className="text-dark-purple text-xl">Select a time </h1>
        {selectBarber && selected ? (
          <>
            <Schedule
              onConfirm={(e) => {
                console.log("adfsjskl j");
                console.log(e);
                settiemInfo(e);
                setisOpenDailog(true);
              }}
              key={selectBarber.fullName + selectBarber.id}
              barber={selectBarber}
              service={selected}
            />
          </>
        ) : (
          <p className="text-dark-purple"> Please Select Barber</p>
        )}
        {selectBarber && tiemInfo && selected && (
          <AppointmentConfirmationDialog
            isPending={isPending}
            onClose={() => {
              setisOpenDailog(false);
            }}
            onSubmit={() => {
              setisOpenDailog(false);

              handleSubmit();
              // redirect("/appointments/history");
            }}
            barber={selectBarber}
            datetime={tiemInfo}
            open={isOpenDailog}
            service={{
              duration: selected?.duration,
              price: selected?.price,
              title: selected?.name,
            }}
          />
        )}
      </div>
    </div>
  );
};

export default SchedulePageUser;
