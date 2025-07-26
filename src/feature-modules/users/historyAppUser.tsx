"use client";
import HeroAllPage from "@/components/layout/HeroAllPage";
import React, { useState } from "react";
import { useUser } from "@clerk/nextjs";
import { Icon } from "@/constants/icons";
import { redirect } from "next/navigation";
import {
  useDeleteAppointment,
  useFilteredAppointments,
} from "@/feature-modules/booking/useAppointment";
import { AppointmentProps } from "@/feature-modules/booking/action";
import { convertToDate } from "@/lib/convertTimestamp";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import CancelAppointmentDialog from "./components/CancelAppointmentDialog";
import { toast } from "sonner";
import { useSendNotification } from "../booking/useAppointmentNotifcation";
import { queryClient } from "@/app/PageProvider";
import { useSendEmail } from "@/hook/useSendEmail";
import { useSelectedAppointment } from "./store";
import AppointmentReviewDialog from "./components/RatingDailog";
import AppointmentCardSkeleton from "./components/AppointmentCardSkeleton";
import { useSubmitReview } from "./hooks/useReviw";
import { CldImage } from "next-cloudinary";

const HistoryAppUser = () => {
  const { user } = useUser();
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [isOpenDailog, setisOpenDailog] = useState(false);
  const { mutate: deleteIt } = useDeleteAppointment();
  const { setSelected } = useSelectedAppointment();
  const { mutate: AddReview, isPending: pendingReview } = useSubmitReview();
  const { data: appointments, isLoading } = useFilteredAppointments({
    filters: {
      userid: user?.id || "user_2xzFq8rlMKmMpKHIHMZcNjEdqKO",
      barberId: "All",
      serviceId: "All",
    },
  });
  const { mutate: sendNotification } = useSendNotification();
  const { mutate } = useSendEmail();

  const handleReview = ({
    rate,
    review,
    appointment,
  }: {
    rate: number;
    review: string;
    appointment: AppointmentProps;
  }) => {
    console.log(appointment);
    const userName = appointment.user.fullName || "";
    const userEmail = appointment.user.email || "";
    const barberName = appointment.barber.fullName || "";
    const barberEmail = appointment.barber.barberEmail || "";
    const appointmentID = appointment.id || "";
    const barberId = appointment.barber.id || "";
    const userId = appointment.user.id || "";

    // Define the query key (same as used in useFilteredAppointments)
    const queryKey = [
      "appointments",
      {
        userid: user?.id || "user_2xzFq8rlMKmMpKHIHMZcNjEdqKO",
        barberId: "All",
        serviceId: "All",
      },
    ];

    // 🔄 Optimistically update the appointment in React Query cache
    queryClient.setQueryData(
      queryKey,
      (oldData: AppointmentProps[] | undefined) => {
        if (!oldData) return [];
        return oldData.map((appt) =>
          appt.id === appointmentID
            ? { ...appt, isBlocked: true } // Note: fixed typo from isBlocking to isBlocked
            : appt
        );
      }
    );

    AddReview(
      {
        appointmentID,
        barberEmail,
        barberId,
        barberName,
        rating: rate,
        reviewMessage: review,
        userEmail,
        userId,
        userName,
      },
      {
        onSuccess: () => {
          toast.success("Success Review Appointment");
          setisOpenDailog(false);
        },
      }
    );

    // 🔔 Notification
    sendNotification({
      userId,
      barberId,
      type: "review",
      title: "New Review Submitted",
      message: `${userName} left a review for their recent appointment. review : ${review} , Rating : ${rate}`,
    });

    // 📧 HTML Email Body
    const htmlContent = `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;padding:24px;border:1px solid #eee;border-radius:10px;background:#fff;">
      <h2 style="color:#5b2d90;">🌟 New Review Submitted</h2>
      <p><strong>From:</strong> ${userName} (${userEmail})</p>
      <p><strong>Barber:</strong> ${barberName}</p>
      <p><strong>Rating:</strong> ${"⭐️".repeat(rate)} (${rate}/5)</p>
      <p style="margin-top:12px;"><strong>Review:</strong><br/>${review}</p>
      <hr style="margin:24px 0;"/>
      <p style="color:#888;font-size:12px;">Barber Booking System</p>
    </div>
  `;
    console.log(barberEmail);
    mutate({
      to: barberEmail,
      from: userEmail,
      subject: "You Received a New Review",
      message: "Client review submitted",
      emailUser: userEmail,
      html: htmlContent,
    });
    // 📧 Send to System
    mutate({
      to: "barbersystem72@gmail.com",
      from: userEmail,
      subject: "Client Submitted a Review",
      message: "New review submitted",
      emailUser: userEmail,

      html: htmlContent,
    });

    // 📧 Send to Barber
  };

  const handleCancel = (
    appointmentId: string,
    barberId: string,
    barberName: string,
    serviceName: string,
    date: Date,
    startTime: string,
    userId: string,
    userEmail: string,
    barberEmail: string
  ) => {
    // Optimistic update - remove appointment immediately from UI
    const queryKey = [
      "appointments",
      {
        userid: user?.id,
        barberId: "All",
        serviceId: "All",
      },
    ];

    // Store previous data for rollback if needed

    // Optimistically update the cache
    queryClient.setQueryData(
      queryKey,
      (oldData: AppointmentProps[] | undefined) => {
        if (!oldData) return [];
        return oldData.filter(
          (appointment) => appointment.id !== appointmentId
        );
      }
    );

    deleteIt(appointmentId, {
      onSuccess: () => {
        toast.success("Appointment cancelled successfully");
        // Invalidate and refetch to ensure consistency
      },
      onError: (error) => {
        console.error("Failed to cancel appointment:", error);
        toast.error("Failed to cancel appointment");
        // Rollback optimistic update on error
      },
    });

    // Send notification
    sendNotification({
      userId,
      barberId,
      title: "Appointment Cancelled",
      type: "cancelled-user",
      message: `${
        user?.fullName
      } cancelled their appointment for ${serviceName} with ${barberName} on ${date.toDateString()} at ${startTime}.`,
    });

    mutate(
      {
        to: barberEmail,
        emailUser: userEmail,
        from: "barbersystem72@gmail.com",
        subject: "Appointment Cancelled",
        message: `A customer (${
          user?.fullName
        }) cancelled their appointment for ${serviceName} on ${date.toDateString()} at ${startTime}.`,
      },
      {
        onSuccess: () => {
          console.log("Barber notified");
        },
        onError: (err) => {
          console.error("Failed to notify barber:", err);
        },
      }
    );
    mutate(
      {
        to: "barbersystem72@gmail.com", // this email receives booking notice
        from: userEmail, // user's actual email
        subject: "Appointment Cancelled",
        message: `A customer (${
          user?.fullName
        }) cancelled their appointment for ${serviceName} on ${date.toDateString()} at ${startTime} of barber ${barberName}.`,
        emailUser: userEmail, // user's email for reply
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
  };

  const filteredAppointments = appointments
    ?.filter((appointment) => {
      if (selectedStatus === "All") return true;
      return appointment.status === selectedStatus;
    })
    .sort((a, b) => {
      const aDate = convertToDate(a.date).getTime();
      const bDate = convertToDate(b.date).getTime();
      return bDate - aDate;
    });

  return (
    <div className="flex flex-col items-center w-full gap-6 justify-start min-h-screen">
      <HeroAllPage
        title="Appointments History"
        image="/images/bg-servics.png"
      />

      {/* Filter Dropdown */}
      <div className="w-full flex justify-start mt6 lg:mt-24 items-center">
        <Select onValueChange={setSelectedStatus} defaultValue="All">
          <SelectTrigger className="w-[200px] border-2 rounded-none border-dark-purple">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="All">All Appointments</SelectItem>
            <SelectItem value="finished">Finished Appointments</SelectItem>
            <SelectItem value="not-finished">
              Not Finished Appointments
            </SelectItem>
            <SelectItem value="expired">Expired Appointments</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="w-full">
        {isLoading ? (
          <AppointmentCardSkeleton />
        ) : filteredAppointments && filteredAppointments.length > 0 ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 grid-cols-1 w-full gap-3 justify-center py-10">
            {filteredAppointments.map((appointment: AppointmentProps) => {
              const dateObj = convertToDate(appointment.date);
              const startObj = convertToDate(appointment.startTime);
              const endObj = new Date(
                startObj.getTime() + appointment.service.duration * 60000
              );

              return (
                <div
                  key={appointment.id}
                  className="w-full h-[190px] border flex flex-col justify-between items-center gap-6 sm:p-4 p-3 rounded-lg text-white bg-dark-purple shadow hover:shadow-lg transition-shadow"
                >
                  <div className="flex items-center max-h-[100px]  min-h-[70px] justify-between w-full mb-4 gap-2 sm:gap-3">
                    <div className="flex w-full gap-3 flex-col items-start">
                      <p className="flex text-sm sm:text-[16px] items-center gap-1">
                        <Icon
                          name="appoitment"
                          color="#ffffff"
                          className="w-5 sm:w-6 sm:h-6 h-5"
                        />
                        <span>{dateObj.toLocaleDateString()}</span>
                      </p>
                      <p className="flex text-sm sm:text-[16px] items-center gap-1">
                        <Icon
                          name="clock"
                          color="#ffffff"
                          className="w-5 sm:w-6 sm:h-6 h-5"
                        />
                        <span>
                          {startObj.toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                            hour12: false,
                          })}{" "}
                          -{" "}
                          {endObj.toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </p>
                    </div>

                    <div className="flex flex-col gap-3 w-full items-start justify-center">
                      <p className="flex items-center gap-1">
                        <CldImage
                          width="24"
                          height="24"
                          src={appointment.service.imageUrl}
                          sizes="24px"
                          removeBackground
                          alt="Service Image"
                          className="w-5 sm:w-6 sm:h-6 h-5 filter invert brightness-0"
                        />
                        <span className="ml-2 text-sm sm:text-[16px] text-white">
                          {appointment.service.name}
                        </span>
                      </p>

                      <p className="flex text-sm sm:text-[16px] items-center gap-1">
                        <Icon
                          className="w-5 sm:w-6 sm:h-6 h-5"
                          name="barber"
                          color="#ffffff"
                        />
                        <span className="ml-2">
                          {appointment.barber.fullName}
                        </span>
                      </p>
                    </div>
                  </div>

                  {appointment.status === "finished" && (
                    <div className="flex items-center mb-1 gap-3 font-semibold justify-center w-full">
                      <button
                        onClick={() => redirect(`/booking/services`)}
                        className="bg-white text-nowrap py-3 w-[76%] text-dark-purple"
                      >
                        Re-book appointment
                      </button>
                      {!appointment.isBlocked && (
                        <AppointmentReviewDialog
                          onSubmit={(e) => {
                            console.log(appointment);
                            handleReview({
                              appointment: appointment,
                              rate: e.rate,
                              review: e.review,
                            });
                          }}
                          isOpen={isOpenDailog}
                          onOpen={() => setisOpenDailog((pre) => !pre)}
                          isPending={pendingReview}
                        />
                      )}
                    </div>
                  )}

                  {appointment.status === "not-finished" && (
                    <div className="flex items-center w-full mb-1 text-sm justify-center gap-3">
                      <CancelAppointmentDialog
                        serviceName={appointment.service.name}
                        barberName={appointment.barber.fullName}
                        datetime={dateObj}
                        starttime={startObj}
                        onCancel={() =>
                          handleCancel(
                            appointment.id as string,
                            appointment.barber.id,
                            appointment.barber.fullName,
                            appointment.service.name,
                            dateObj,
                            startObj.toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            }),
                            user?.id || "",
                            user?.emailAddresses[0]?.emailAddress || "",
                            appointment.barber.barberEmail || ""
                          )
                        }
                      />
                      <button
                        onClick={() => {
                          setSelected(appointment);
                          redirect("/appointments/reschedule");
                        }}
                        className="text-white border w-full py-3 border-white"
                      >
                        Reschedule
                      </button>
                    </div>
                  )}

                  {appointment.status === "cancelled" && (
                    <p className="text-white py-3 w-full text-center text-xl font-semibold">
                      Cancelled Appointment
                    </p>
                  )}

                  {appointment.status === "expired" && (
                    <p className="text-white py-3 w-full text-center text-xl font-semibold">
                      Expired Appointment
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-gray-500 text-center">No appointments found.</p>
        )}
      </div>
    </div>
  );
};

export default HistoryAppUser;
