"use server";
import { localToUTC } from "@/lib/dayjs"; // or wherever your utils are

import { db } from "@/lib/firebase";
import {
  collection,
  addDoc,
  where,
  getDocs,
  query,
  Timestamp,
  updateDoc,
  doc,
  deleteDoc,
} from "firebase/firestore";
import { Service } from "../barber/type";

export interface AppointmentProps {
  service: Service;
  user: {
    id?: string | null;
    fullName: string | null;
    email?: string | null;
  };
  barber: {
    id: string;
    fullName: string;
    barberEmail?: string; // Optional, if barber has an email
    profileImage: string;
  };
  date?: Timestamp; // e.g. "2023-10-01"
  status: "not-finished" | "finished" | "expired" | "cancelled";
  isBlocked: boolean;
  dayOffWeek: [
    | "SUNDAY"
    | "MONDAY"
    | "TUESDAY"
    | "WEDNESDAY"
    | "THURSDAY"
    | "FRIDAY"
    | "SATURDAY"
  ];
  isCancelled: boolean;
  sentReminder: boolean;
  startTime?: Timestamp; // ISO string format
  datetime?: {
    date: Date;
    time: string; // e.g. "12:20 PM"
  };
  id?: string; // Optional, for existing appointments
  createdAt?: Timestamp; // Optional, for existing appointments
  totalBookings?: number; // Optional, for tracking bookings
}

// export async function addAppointment({
//   service,
//   user,
//   barber,
//   datetime,
//   dayOffWeek,
//   totalBookings,
// }: AppointmentProps) {
//   try {
//     if (!datetime?.date) {
//       throw new Error("Appointment date is required");
//     }

//     const appointmentDate = datetime.date;

//     const timeStr = convertTo24Hr(datetime?.time || "00:00");

//     const startTime = new Date(
//       `${appointmentDate.toISOString().split("T")[0]}T${timeStr}`
//     );
//     // Update barber's total booking count
//     const barberRef = doc(db, "barbers", barber.id);
//     await updateDoc(barberRef, {
//       totalBookings: (totalBookings || 0) + 1,
//     });
//     const appointmentData = {
//       service,
//       user,
//       barber,
//       date: Timestamp.fromDate(appointmentDate),
//       startTime: Timestamp.fromDate(startTime),
//       status: "not-finished", // Default status
//       isBlocked: false,
//       dayOffWeek,
//       isCancelled: false,
//       sentReminder: false,
//       createdAt: Timestamp.now(),
//     };

//     const docRef = await addDoc(
//       collection(db, "appointments"),
//       appointmentData
//     );

//     return { success: true, id: docRef.id };
//   } catch (err: unknown) {
//     let errorMessage = "Something went wrong";
//     if (err instanceof Error) {
//       errorMessage = err.message;
//     }
//     console.error("❌ Failed to add appointment:", errorMessage);
//     return { success: false, error: errorMessage };
//   }
// }

export async function addAppointment({
  service,
  user,
  barber,
  datetime,
  dayOffWeek,
  totalBookings,
}: AppointmentProps) {
  try {
    if (!datetime?.date) {
      throw new Error("Appointment date is required");
    }

    const date = datetime.date; // This is a JS Date object
    const timeStr = convertTo24Hr(datetime?.time || "00:00");

    // ✅ Convert local Baghdad time to UTC
    const utcStartTime = localToUTC(date.toISOString().split("T")[0], timeStr);

    // Update barber's total booking count
    const barberRef = doc(db, "barbers", barber.id);
    await updateDoc(barberRef, {
      totalBookings: (totalBookings || 0) + 1,
    });

    const appointmentData = {
      service,
      user,
      barber,
      date: Timestamp.fromDate(date), // Keep original date if it's just for calendar day
      startTime: Timestamp.fromDate(utcStartTime), // Corrected time
      status: "not-finished",
      isBlocked: false,
      dayOffWeek,
      isCancelled: false,
      sentReminder: false,
      createdAt: Timestamp.now(),
    };

    const docRef = await addDoc(
      collection(db, "appointments"),
      appointmentData
    );

    return { success: true, id: docRef.id };
  } catch (err: unknown) {
    let errorMessage = "Something went wrong";
    if (err instanceof Error) {
      errorMessage = err.message;
    }
    console.error("❌ Failed to add appointment:", errorMessage);
    return { success: false, error: errorMessage };
  }
}

// ✅ Converts "12:20 PM" to "12:20:00"
function convertTo24Hr(time: string): string {
  const [hourMin, ampm] = time.trim().split(" ");
  const [hourRaw, min] = hourMin.split(":").map(Number);
  let hour = hourRaw;

  if (ampm === "PM" && hour !== 12) hour += 12;
  if (ampm === "AM" && hour === 12) hour = 0;

  return `${hour.toString().padStart(2, "0")}:${min
    .toString()
    .padStart(2, "0")}:00`;
}

// gite time

export const getAppointments = async (): Promise<
  | { success: true; data: AppointmentProps[] }
  | { success: false; error: string }
> => {
  try {
    const snapshot = await getDocs(collection(db, "appointments"));
    const results: AppointmentProps[] = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...(doc.data() as Omit<AppointmentProps, "id">),
    }));

    return { success: true, data: results };
  } catch (err: unknown) {
    let error = "Something went wrong";
    if (err instanceof Error) error = err.message;
    console.error("❌ Error getting appointments:", error);
    return { success: false, error };
  }
};

// export async function getAppointmentsByFilter(filters: FilterOptions) {
//   const { barberId, serviceId, from, to } = filters;

//   const ref = collection(db, "appointments");
//   const constraints = [];

//   if (barberId !== "All") constraints.push(where("barber.id", "==", barberId));
//   if (serviceId !== "All")
//     constraints.push(where("service.id", "==", serviceId));

//   const fromDate = new Date(from);
//   const toDate = new Date(to);
//   fromDate.setHours(0, 0, 0);
//   toDate.setHours(23, 59, 59);

//   constraints.push(where("date", ">=", Timestamp.fromDate(fromDate)));
//   constraints.push(where("date", "<=", Timestamp.fromDate(toDate)));

//   const q = query(ref, ...constraints);
//   const snap = await getDocs(q);
//   const appointmentData = snap.docs.map((doc) => ({
//     id: doc.id,
//     ...doc.data(),
//     return snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

//   });
// }
export interface FilterOptions {
  barberId?: string;
  serviceId?: string;
  from?: string;
  to?: string;
  enabled?: boolean; // Optional, to enable/disable filtering
  // Add more filter options as needed
  userid?: string;
  status?: "not-finished" | "finished" | "expired";
}
export async function getFilteredAppointments(
  filters: FilterOptions
): Promise<AppointmentProps[]> {
  const { userid, barberId, from, serviceId, status, to } = filters;

  const ref = collection(db, "appointments");
  const constraints = [];

  if (barberId !== "All") {
    constraints.push(where("barber.id", "==", barberId));
  }

  if (serviceId !== "All") {
    constraints.push(where("service.id", "==", serviceId));
  }
  if (status) {
    constraints.push(where("status", "==", status));
  }
  if (userid) {
    constraints.push(where("user.id", "==", userid));
  }
  if (from && to && typeof from === "string" && typeof to === "string") {
    // Ensure both from and to are provided

    const fromDate = new Date(from);
    const toDate = new Date(to);
    fromDate.setHours(0, 0, 0, 0);
    toDate.setHours(23, 59, 59, 999);

    constraints.push(where("date", ">=", Timestamp.fromDate(fromDate)));
    constraints.push(where("date", "<=", Timestamp.fromDate(toDate)));
  }

  const q = query(ref, ...constraints);
  const snap = await getDocs(q);

  return snap.docs.map((doc) => {
    const data = doc.data() as Omit<AppointmentProps, "id">;

    return {
      id: doc.id,
      ...data,
      date: data.date, // ✅ Firestore Timestamp (NOT converted)
      startTime: data.startTime,
      createdAt: data.createdAt,
    };
  });
}

export async function updateAppointmentStatus(
  id: string,
  status: "finished" | "not-finished"
) {
  try {
    const ref = doc(db, "appointments", id);
    await updateDoc(ref, { status });
    return { success: true };
  } catch (err) {
    console.error("❌ Error updating appointment status:", err);
    return { success: false, error: (err as Error).message };
  }
}

export async function deleteAppointment(appointmentId: string) {
  const ref = doc(db, "appointments", appointmentId);
  await deleteDoc(ref);
}
export const cancelAppointment = async (appointmentId: string) => {
  if (!appointmentId) throw new Error("Appointment ID is required");

  const ref = doc(db, "appointments", appointmentId);
  await updateDoc(ref, {
    status: "cancelled",
  });
};
