"use client";
import {
  FaEdit,
  FaPaperPlane,
  FaCheck,
  FaTimesCircle,
  FaBan,
} from "react-icons/fa";
import { AppointmentProps, updateAppointmentStatus } from "../action/action";
import { redirect } from "next/navigation";
import {
  useCancelAppointment,
  useUpdateAppointmentStatus,
} from "../hook/useAppointment";
import { useSelectedAppointment } from "@/feature-modules/users/action/store";
import { toast } from "sonner";
import { useSendNotification } from "../hook/useAppointmentNotifcation";
import { useSendEmail } from "@/hook/useSendEmail";
import { Timestamp } from "firebase/firestore";
import { convertToDate } from "@/lib/convertTimestamp";
import BroadcastMessageDialog from "@/feature-modules/dashboard/component/BroadcastMessageDialogProps";
import { useMemo, useState } from "react";

const btnBase =
  "flex items-center gap-2 rounded-sm px-3 py-2 text-[13px] sm:text-sm font-medium bg-[#480024] text-white hover:bg-[#5e0030] text-nowrap active:translate-y-px disabled:opacity-50 disabled:cursor-not-allowed";

const ActionBar = ({ app }: { app: AppointmentProps }) => {
  const [open, setOpen] = useState(false);

  // hooks with pending flags
  const { mutate: updateAppointment, isPending: isUpdatingStatus } =
    useUpdateAppointmentStatus();
  const { mutate: cancelAppointment, isPending: isCancelling } =
    useCancelAppointment();
  const { mutate: sendNotification, isPending: isSendingNotification } =
    useSendNotification();
  const { mutate: sendEmail, isPending: isSendingEmail } = useSendEmail();

  const { setSelected } = useSelectedAppointment();

  // only allow actions when not finished yet
  const canAct = useMemo(() => app?.status === "not-finished", [app?.status]);

  // individual disabled states
  const disableUpdate = !canAct;
  const disableFinish = !canAct || isUpdatingStatus;
  const disableExpire =
    !canAct || isUpdatingStatus || isSendingEmail || isSendingNotification;
  const disableCancel =
    !canAct || isCancelling || isSendingEmail || isSendingNotification;

  const handleUpdate = () => {
    if (!canAct) return;
    redirect("/dashboard/appointments/create");
  };

  const handleSendMessage = (body: string, subject: string) => {
    if (!canAct) return;

    const html = `
      <div style="max-width:600px;margin:0 auto;background:#fff;border:1px solid #ddd;border-radius:8px;overflow:hidden;font-family:'Segoe UI',sans-serif;box-shadow:0 4px 10px rgba(0,0,0,0.1)">
        <div style="background:#460028;color:#fff;padding:24px;text-align:center">
          <h1 style="margin:0;font-size:22px">📢 Announcement</h1>
          <p style="margin:8px 0 0;font-size:14px">from <strong>OAP Barber</strong></p>
        </div>
        <div style="padding:24px;font-size:16px;line-height:1.6;color:#333;background:#fefefe">
          <p style="white-space:pre-line;margin:0 0 24px;">${body}</p>
        </div>
        <div style="background:#fafafa;border-top:1px solid #eee;padding:16px;text-align:center;font-size:12px;color:#888">
          <p style="margin:4px 0">You're receiving this email because you have an account with OAP Barber.</p>
          <p style="margin:4px 0">© ${new Date().getFullYear()} OAP Barber</p>
        </div>
      </div>
    `;

    const u = app.user;
    if (!u?.email) {
      toast.error("User has no email.");
      return;
    }

    // send email
    sendEmail(
      {
        to: u.email,
        subject,
        html,
        emailUser: u.email,
        from: "barbersystem72@gmail.com",
        message: body || "Message",
      },
      {
        onSuccess: () => {
          toast.success("Email sent.");
        },
        onError: (e) => {
          toast.error("Failed to send email.");
          console.log(e);
        },
      }
    );

    // send in-app notification
    sendNotification(
      {
        userId: u.id || "",
        title: subject,
        barberId: app.barber?.id || "",
        message: body || "Message",
        type: "message-to-user",
      },
      {
        onSuccess: () => {
          toast.success("Notification sent.");
        },
        onError: (e) => {
          toast.error("Failed to send notification.");
          console.log(e);
        },
      }
    );
  };

  const handleFinish = () => {
    if (!canAct) return;

    updateAppointment(
      { id: app.id || "", status: "finished" },
      {
        onSuccess: () => {
          toast.success("Appointment marked as finished.");
          setSelected({ ...app, status: "finished" });
        },
        onError: (e) => {
          toast.error("Failed to mark as finished.");
          console.log(e);
        },
      }
    );
  };

  const handleExpire = () => {
    if (!canAct) return;

    setSelected({ ...app, status: "expired" });

    if (app.user?.email && app.user.email.length > 3) {
      // update status (uses direct action you already had)
      updateAppointmentStatus(app?.id || "", "expired")
        .then(() => {
          toast.success("Appointment marked as expired.");
        })
        .catch((e) => {
          toast.error("Failed to mark as expired.");
          console.log(e);
        });

      // email
      sendEmail(
        {
          emailUser: app.user.email,
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
                ).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}</p>
                <p><strong>✂️ Service:</strong> ${app.service.name} - ${
            app.service.price
          } £</p>
                <p><strong>💈 Barber:</strong> ${app.barber.fullName}</p>
                <p><strong>Status:</strong> expired</p>
              </div>
              <p style="margin-top: 20px;">If this is a mistake or you’d like to reschedule, please contact us.</p>
              <p>We’re here whenever you're ready for your next visit ✂️</p>
              <p style="color: #999; font-size: 12px;">This is an automated message. Please do not reply directly.</p>
            </div>
          `,
          subject: `Your appointment on ${convertToDate(
            app.date
          ).toLocaleDateString()} has expired`,
          to: app.user.email,
        },
        {
          onSuccess: () => console.log("📨 Expired email sent"),
          onError: (e) => console.log("❌ Error sending expired email: " + e),
        }
      );

      // notification
      sendNotification(
        {
          barberId: app.barber?.id || "",
          title: "Appointment Expired",
          message: `Your appointment on ${convertToDate(
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
    } else {
      toast.message("Marked expired. User has no email on file.");
    }
  };

  const handleCancel = () => {
    if (!canAct) return;

    setSelected({ ...app, status: "cancelled", isCancelled: true });

    cancelAppointment(app?.id || "", {
      onSuccess: () => {
        toast.success("Appointment cancelled.");

        // notify user
        sendNotification({
          userId: app.user.id || "",
          barberId: app.barber.id,
          type: "cancelled-admin",
          title: "Appointment Cancelled",
          message: `Your appointment on ${
            app.date ? formatDate(app.date) : ""
          } at ${
            app.startTime ? formatTime(app.startTime) : ""
          } has been cancelled.`,
        });

        // email user
        if (app.user.email) {
          sendEmail({
            to: app.user.email,
            from: "noreply@barbersystem.com",
            subject: "Your Appointment Was Cancelled",
            emailUser: app.user.email,
            message: "Cancellation notice",
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 24px; border: 1px solid #e0e0e0; border-radius: 10px; background-color: #fff;">
                <h2 style="color: #b00020; border-bottom: 2px solid #b00020; padding-bottom: 8px;">Appointment Cancelled</h2>
                <p style="font-size: 16px; margin: 16px 0;">Hello <strong>${
                  app.user.fullName
                }</strong>,</p>
                <p style="font-size: 15px; margin: 16px 0;">We regret to inform you that your appointment has been <strong style="color:#b00020;">cancelled</strong>.</p>
                <table style="width: 100%; font-size: 14px; margin-bottom: 24px;">
                  <tr><td style="padding: 8px 0;"><strong>Service:</strong></td><td>${
                    app.service?.name || "N/A"
                  }</td></tr>
                  <tr><td style="padding: 8px 0;"><strong>Date:</strong></td><td>${
                    app.date ? formatDate(app.date) : "N/A"
                  }</td></tr>
                  <tr><td style="padding: 8px 0;"><strong>Time:</strong></td><td>${
                    app.startTime ? formatTime(app.startTime) : "N/A"
                  }</td></tr>
                </table>
                <p style="font-size: 14px; color: #555;">If this was a mistake or you wish to reschedule, please contact our support team.</p>
                <p style="margin-top: 24px; font-size: 14px;">Best regards,<br/><strong>Barber Booking System</strong></p>
              </div>
            `,
          });
        }

        // email barber
        if (app.barber?.barberEmail) {
          sendEmail({
            to: app.barber.barberEmail,
            from: "noreply@barbersystem.com",
            subject: "Client Cancelled Appointment",
            emailUser: app.user.email || "",
            message: "Cancellation by client",
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 24px; border: 1px solid #e0e0e0; border-radius: 10px; background-color: #fff;">
                <h2 style="color: #b00020; border-bottom: 2px solid #b00020; padding-bottom: 8px;">Client Cancelled Appointment</h2>
                <p style="font-size: 16px; margin: 16px 0;">Hello <strong>${
                  app.barber.fullName
                }</strong>,</p>
                <p style="font-size: 15px; margin: 16px 0;">Your client <strong>${
                  app.user.fullName
                }</strong> has <strong style="color:#b00020;">cancelled</strong> their appointment.</p>
                <table style="width: 100%; font-size: 14px; margin-bottom: 24px;">
                  <tr><td style="padding: 8px 0;"><strong>Service:</strong></td><td>${
                    app.service?.name || "N/A"
                  }</td></tr>
                  <tr><td style="padding: 8px 0;"><strong>Date:</strong></td><td>${
                    app.date ? formatDate(app.date) : "N/A"
                  }</td></tr>
                  <tr><td style="padding: 8px 0;"><strong>Time:</strong></td><td>${
                    app.startTime ? formatTime(app.startTime) : "N/A"
                  }</td></tr>
                </table>
                <p style="font-size: 14px; color: #555;">Please update your schedule accordingly.</p>
                <p style="margin-top: 24px; font-size: 14px;">Regards,<br/><strong>Barber Booking System</strong></p>
              </div>
            `,
          });
        }
      },
      onError: (e) => {
        toast.error("Failed to cancel appointment.");
        console.log(e);
      },
    });
  };

  return (
    <div className="flex overflow-x-auto w-full items-center gap-2">
      <BroadcastMessageDialog
        isOpen={open}
        onOpen={() => setOpen((pre) => !pre)}
        hiddenTregger={true}
        onSubmit={(m, s) => handleSendMessage(m, s)}
        title="Send Message"
        subtitle="Write and deliver a custom message to the selected user."
        // optional: if your dialog supports disabling submit
      />

      <button
        onClick={handleUpdate}
        className={btnBase}
        aria-label="Update appointment"
        disabled={disableUpdate}
      >
        <FaEdit size={14} />
        Update
      </button>

      <button
        onClick={() => setOpen(true)}
        className={btnBase}
        aria-label="Send message"
        //    disabled={disableSendMessage}
      >
        <FaPaperPlane size={14} />
        {isSendingEmail || isSendingNotification
          ? "Sending..."
          : "Send message"}
      </button>

      <button
        onClick={handleFinish}
        className={btnBase}
        aria-label="Mark as finished"
        disabled={disableFinish}
      >
        <FaCheck size={14} />
        {isUpdatingStatus ? "Finishing..." : "Finish"}
      </button>

      <button
        onClick={handleExpire}
        className={btnBase}
        aria-label="Mark as expired"
        disabled={disableExpire}
      >
        <FaTimesCircle size={14} />
        {isUpdatingStatus || isSendingEmail || isSendingNotification
          ? "Working..."
          : "Expire"}
      </button>

      <button
        onClick={handleCancel}
        className={btnBase}
        aria-label="Cancel appointment"
        disabled={disableCancel}
      >
        <FaBan size={14} />
        {isCancelling ? "Cancelling..." : "Cancel"}
      </button>
    </div>
  );
};

export default ActionBar;

// ===== utils for date/time formatting =====
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
