import { Barber, Service } from "@/feature-modules/barber/type/type";
import { Timestamp } from "firebase/firestore";
import { AppointmentProps } from "../action/action";

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
export type AppointmentStatus =
  | "all"
  | "not-finished"
  | "finished"
  | "expired"
  | "cancelled";

export interface AppointmentsTableProps {
  filters: {
    barberId?: string;
    serviceId?: string;
    from?: string;
    to?: string;
  };
  role: "barber" | "admin";
  barbers?: Barber[];
  services?: Service[];
  handleFilterChange: (key: "barberId" | "serviceId", value: string) => void;
  isLoading: boolean;
  error?: { message: string };
  appointments?: AppointmentProps[];
  tabs: AppointmentStatus;
  handleCancel: (app: AppointmentProps) => void;
  setSelected?: (app: AppointmentProps) => void;
  mutate: (params: {
    id: string;
    status: "finished" | "not-finished" | "expired";
  }) => void;
}
