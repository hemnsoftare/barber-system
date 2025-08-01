import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  addAppointment,
  AppointmentProps,
  cancelAppointment,
  deleteAppointment,
  FilterOptions,
  getAppointments,
  getFilteredAppointments,
  updateAppointmentReminder,
  updateAppointmentStatus,
} from "./action";

import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

export function useUpdateAppointment() {
  return useMutation({
    mutationFn: async ({
      id,
      updates,
    }: {
      id: string;
      updates: Partial<AppointmentProps>;
    }) => {
      if (!updates?.datetime) {
        throw new Error("Appointment date is required");
      }

      const appointmentDate = updates.datetime?.date;

      const timeStr = convertTo24Hr(updates.datetime?.time || "00:00");

      const startTime = new Date(
        `${appointmentDate?.toISOString().split("T")[0]}T${timeStr}`
      );
      const ref = doc(db, "appointments", id);
      await updateDoc(ref, {
        startTime,
        service: updates.service,
        date: appointmentDate,
        dayOffWeek: updates.dayOffWeek,
      });
    },
  });
}
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

export const useAddAppointment = () => {
  return useMutation({
    mutationFn: async (data: AppointmentProps) => {
      const res = await addAppointment(data);
      if (!res.success) throw new Error(res.error);
      return res;
    },
  });
};

export const useFilteredAppointments = ({
  enable = true,
  filters,
}: {
  filters: FilterOptions;
  enable?: boolean;
}) => {
  return useQuery<AppointmentProps[]>({
    queryKey: ["appointments", filters],
    queryFn: () => getFilteredAppointments(filters),
    enabled: enable,
  });
};

export function useGetAllAppointments() {
  return useQuery<AppointmentProps[]>({
    queryKey: ["appointments"],
    queryFn: async () => {
      const res = await getAppointments();
      if (!res.success) throw new Error(res.error);
      return res.data;
    },
  });
}

export function useUpdateAppointmentStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      status,
    }: {
      id: string;
      status: "finished" | "not-finished" | "expired";
    }) => updateAppointmentStatus(id, status),

    onSuccess: (updatedAppointment, variables) => {
      queryClient.setQueryData<AppointmentProps[]>(
        ["appointments"],
        (oldData) => {
          if (!oldData) return [];
          return oldData.map((appointment) =>
            appointment.id === variables.id
              ? { ...appointment, status: variables.status }
              : appointment
          );
        }
      );
    },
  });
}

export function useUpdateAppointmentRemiander() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id }: { id: string }) => updateAppointmentReminder(id),

    onSuccess: (updatedAppointment, variables) => {
      queryClient.setQueryData<AppointmentProps[]>(
        ["appointments"],
        (oldData) => {
          if (!oldData) return [];
          return oldData.map((appointment) =>
            appointment.id === variables.id
              ? { ...appointment, sentReminder: true }
              : appointment
          );
        }
      );
    },
  });
}
export function useDeleteAppointment() {
  return useMutation({
    mutationFn: (appointmentId: string) => deleteAppointment(appointmentId),
  });
}

export const useCancelAppointment = () => {
  return useMutation({
    mutationFn: async (appointmentId: string) => {
      await cancelAppointment(appointmentId);
    },
  });
};
