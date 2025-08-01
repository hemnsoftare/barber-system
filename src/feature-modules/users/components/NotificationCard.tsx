import { JSX } from "react";
import { Notification, NotificationType } from "@/feature-modules/booking/type";
import { convertToDate } from "@/lib/convertTimestamp";

interface Props {
  notification: Notification;
  onClick?: () => void;
}

import {
  Pencil,
  XCircle,
  MessageCircle,
  CalendarDays,
  Trash2,
  Scissors,
  RefreshCw,
  Send,
} from "lucide-react"; // import any icons you want
import { IoAlarmOutline } from "react-icons/io5";

const iconMap: Record<NotificationType, JSX.Element> = {
  booked: <CalendarDays className="text-dark-purple" />,
  "cancelled-user": <XCircle className="text-dark-purple" />,
  "cancelled-admin": <XCircle className="text-dark-purple" />,
  rescheduled: <RefreshCw className="text-dark-purple" />,
  finished: <CalendarDays className="text-dark-purple" />,
  review: <MessageCircle className="text-dark-purple" />,
  expired: <CalendarDays className="text-dark-purple" />,
  message: <MessageCircle className="text-dark-purple" />,
  delete_barber: <Trash2 className="text-dark-purple" />,
  "remove-service": <Scissors className="text-dark-purple" />,
  "update-appointment": <Pencil className="text-dark-purple" />,
  "message-to-user": <Send className="text-dark-purple" />,
  reminder: <IoAlarmOutline size={24} className="text-dark-purple" />,
};

export default function NotificationCard({ notification, onClick }: Props) {
  const formattedDate = convertToDate(
    notification.createdAt
  ).toLocaleDateString("en-GB", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="relative border border-dark-purple p-4 mb-4 shadow-sm space-y-2 bg-white rounded-sm">
      {/* Top right mark read */}
      {!notification.read && (
        <button
          onClick={onClick}
          className="absolute top-2 right-2 text-[12px] text-dark-purple font-semibold hover:underline flex items-center gap-1"
        >
          Mark as read
        </button>
      )}

      {/* Icon and content */}
      <div className="flex items-start gap-4">
        <div className="mt-1">{iconMap[notification.type]}</div>
        <div className="flex-1">
          <h3 className="text-xl font-bold text-dark-purple">
            {notification.type === "expired"
              ? "Your Appointment is Expired"
              : notification.title}
          </h3>
          <p className="text-sm text-gray-700">{notification.message}</p>
        </div>
      </div>

      {/* Date */}
      <p className="text-xs text-gray-500 mt-2">{formattedDate}</p>
    </div>
  );
}
