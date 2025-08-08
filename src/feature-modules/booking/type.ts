import { Timestamp } from "firebase/firestore";

export type NotificationType =
  | "booked"
  | "boooked-sucess"
  | "cancelled-user"
  | "cancelled-admin"
  | "rescheduled"
  | "finished"
  | "review"
  | "expired"
  | "delete_barber"
  | "remove-service"
  | "message"
  | "update-appointment"
  | "reminder"
  | "message-to-user";

export interface Notification {
  id?: string;
  userId?: string;
  barberId: string; // ✅ Add this line
  appointmentId?: string;
  type: NotificationType;
  title: string;
  message: string;
  read: boolean;
  createdAt: Timestamp;
}
//
