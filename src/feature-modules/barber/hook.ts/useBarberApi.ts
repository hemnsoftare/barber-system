import {
  useQuery,
  useMutation,
  useQueryClient,
  UseQueryResult,
} from "@tanstack/react-query";
import { AvailabilityData } from "../CreateBarberDashboardpage";
// import { Barber, BarberWithServices } from "../type";
import { Barber, BarberWithServices } from "../type/type";
import {
  // addDayOff,
  addServiceToBarber,
  deleteBarber,
  getAllBarbersWithResolvedServices,
  getBarberById,
  getBarbers,
  removeServiceFromBarber,
  updateAvailability,
  updateBarber,
  updateBarberProfile,
} from "../action/actionBarber";
import {
  arrayRemove,
  arrayUnion,
  doc,
  Timestamp,
  updateDoc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

export const COLLECTION_NAME = "barbers";
export const QUERY_KEY = ["barbers"];
const BARBERS_WITH_SERVICES_QUERY_KEY = ["barbers-with-services"];

// React Query hooks
import {
  writeBatch,
  // query,
  // collection,
  // where,
  // getDocs,
} from "firebase/firestore";
// import { AppointmentProps } from "@/feature-modules/booking/action";
// import { sendEmail } from "@/hook/useSendEmail";
// import { sendNotification } from "@/feature-modules/booking/actionNotifcation";

export type DayOffEntry = {
  date: Date | Timestamp;
  wholeDay: boolean;
  from: string | null; // '3:00'
  to: string | null; // '17:40'
};

// const hm = (t: string): number => {
//   // "11:30" → 690 (minutes from midnight)
//   const [h, m] = t.split(":").map(Number);
//   return h * 60 + m;
// };

// const isSameDay = (date1: Date, date2: Date): boolean => {
//   return (
//     date1.getFullYear() === date2.getFullYear() &&
//     date1.getMonth() === date2.getMonth() &&
//     date1.getDate() === date2.getDate()
//   );
// };

export const useAddDayOff = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      barberId,
      newEntry,
    }: {
      barberId: string;
      newEntry: DayOffEntry;
    }) => {
      console.log(newEntry);

      const dayOffDate =
        newEntry.date instanceof Date
          ? Timestamp.fromDate(newEntry.date)
          : newEntry.date;

      const firestoreEntry: DayOffEntry = {
        ...newEntry,
        date: dayOffDate,
      };

      const batch = writeBatch(db);
      const barberRef = doc(db, "barbers", barberId);

      batch.update(barberRef, {
        offDays: arrayUnion(firestoreEntry),
      });

      // const apptQ = query(
      //   collection(db, "appointments"),
      //   where("barber.id", "==", barberId),
      //   where("status", "==", "not-finished")
      // );

      // const snap = await getDocs(apptQ);
      // const targetDate = dayOffDate.toDate();

      // collect appointments to notify
      // const toNotify: AppointmentProps[] = [];

      // snap.forEach((docSnap) => {
      //   const appointmentData = docSnap.data() as AppointmentProps;

      //   const appointmentDate =
      //     (appointmentData.date && appointmentData.date.toDate()) || new Date();

      //   const appointmentStartTime =
      //     (appointmentData.startTime && appointmentData.startTime.toDate()) ||
      //     new Date();

      //   if (isSameDay(appointmentDate, targetDate)) {
      //     if (newEntry.wholeDay) {
      //       console.log(
      //         `Deleting appointment on whole day off: ${appointmentDate.toDateString()}`
      //       );
      //       toNotify.push({ ...appointmentData, id: docSnap.id });
      //       batch.delete(docSnap.ref);
      //       return;
      //     }

      //     if (!newEntry.wholeDay && newEntry.from && newEntry.to) {
      //       const appointmentStartMinutes =
      //         appointmentStartTime.getHours() * 60 +
      //         appointmentStartTime.getMinutes();
      //       const duration = appointmentData?.service?.duration || 0;
      //       const appointmentEndMinutes = appointmentStartMinutes + duration;

      //       const dayOffStartMinutes = hm(newEntry.from);
      //       const dayOffEndMinutes = hm(newEntry.to);

      //       const overlaps =
      //         appointmentStartMinutes < dayOffEndMinutes &&
      //         appointmentEndMinutes > dayOffStartMinutes;

      //       if (overlaps) {
      //         console.log(
      //           `Deleting appointment overlapping blocked period: ${appointmentStartTime.toTimeString()}, blocked: ${
      //             newEntry.from
      //           }-${newEntry.to}`
      //         );
      //         batch.delete(docSnap.ref);
      //         toNotify.push({ ...appointmentData, id: docSnap.id });
      //       }
      //     }
      //   }
      // });

      // Commit deletions first
      await batch.commit();

      // Send notifications and emails
      // await Promise.all(
      //   toNotify.map((appt) => {
      //     const when = appt?.date
      //       ? `${appt.date.toDate().toLocaleDateString()} at ${
      //           appt.startTime
      //             ? appt.startTime.toDate().toLocaleTimeString([], {
      //                 hour: "2-digit",
      //                 minute: "2-digit",
      //               })
      //             : "Unknown time"
      //         }`
      //       : "Unknown date";

      //     const fullName = appt?.user?.fullName || "Customer";
      //     const barberName = appt?.barber?.fullName || "Your barber";
      //     const serviceName = appt?.service?.name || "a service";

      //     const html = `
      //       <div style="max-width:600px;margin:auto;padding:20px;border:1px solid #eee;border-radius:12px;font-family:sans-serif;background-color:#f9f9f9;">
      //         <h2 style="color:#8b5cf6;">Appointment Cancelled</h2>
      //         <p>Dear <strong>${fullName}</strong>,</p>
      //         <div style="border:1px solid #ddd;border-radius:10px;padding:16px;background:#fff;margin-top:16px;margin-bottom:16px;">
      //           <p style="margin:0;"><strong>Barber:</strong> ${barberName}</p>
      //           <p style="margin:0;"><strong>Service:</strong> ${serviceName}</p>
      //           <p style="margin:0;"><strong>Date:</strong> ${when}</p>
      //         </div>
      //         <p>Unfortunately, your appointment has been cancelled because your barber is unavailable on that day.</p>
      //         <p>Please feel free to book another available time or choose a different barber.</p>
      //         <a href="https://yourbookingapp.com/reschedule" style="display:inline-block;margin-top:20px;padding:10px 20px;background-color:#8b5cf6;color:#fff;text-decoration:none;border-radius:8px;">Reschedule Now</a>
      //         <p style="margin-top:30px;">Best regards,<br>The Barber-Booking Team</p>
      //       </div>
      //     `;
      //     console.log(html);
      //     return Promise.all([
      //       sendNotification({
      //         userId: appt.user.id || "",
      //         barberId,
      //         appointmentId: appt.id,
      //         type: "cancelled-admin",
      //         title: "Appointment Cancelled",
      //         message: `Hi ${fullName}, your appointment with ${barberName} on ${when} was cancelled because the barber is unavailable.`,
      //       }),
      //       sendEmail({
      //         to: appt?.user?.email || "",
      //         emailUser: appt?.user?.email || "",
      //         from: "no-reply@yourapp.com",
      //         subject: "Your appointment has been cancelled",
      //         message: `Hi ${appt?.user?.fullName}, your appointment has been cancelled because your barber's working hours changed.`,
      //         html,
      //       }),
      //     ]);
      //   })
      // );
    },

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["barbers"] });
    },
  });
};

export const useRemoveDayOff = () => {
  return useMutation({
    mutationFn: async ({
      barberId,
      entryToRemove,
    }: {
      barberId: string;
      entryToRemove: DayOffEntry;
    }) => {
      const barberRef = doc(db, "barbers", barberId);

      // Narrow date type explicitly here:
      const dateAsDate: Date =
        entryToRemove.date instanceof Timestamp
          ? entryToRemove.date.toDate()
          : entryToRemove.date;

      // Now create cleanEntry with date strictly as Date
      const cleanEntry: DayOffEntry = {
        date: dateAsDate,
        wholeDay: entryToRemove.wholeDay,
        from: entryToRemove.from ?? null,
        to: entryToRemove.to ?? null,
      };

      // Tell TypeScript that cleanEntry.date is Date when passing to fromDate()
      const timestampEntry = {
        ...cleanEntry,
        date: Timestamp.fromDate(cleanEntry.date as Date),
      };

      await updateDoc(barberRef, {
        offDays: arrayRemove(timestampEntry),
      });
    },
  });
};
export const useUpdateAvailability = () => {
  return useMutation({
    mutationFn: ({
      data,
      dataOld,
      barberId,
    }: {
      data: AvailabilityData[];
      dataOld: AvailabilityData[];
      barberId: string;
    }) => updateAvailability({ data, barberId, dataOld }),
  });
};
export const useUpdateBarberProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateBarberProfile,
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["barber", variables.barberId],
      });
      queryClient.invalidateQueries({ queryKey: ["barbers"] });
      queryClient.invalidateQueries({ queryKey: ["barbers-with-services"] });
    },
  });
};
export const useAddServiceToBarber = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: addServiceToBarber,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
  });
};
export const useRemoveServiceFromBarber = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: removeServiceFromBarber,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
  });
};
export const useGetBarbers = (
  limt?: number
): UseQueryResult<Barber[], Error> => {
  return useQuery({
    queryKey: ["barbers", limt],
    queryFn: () => getBarbers({ limt }),
    staleTime: 5 * 60 * 1000,
  });
};
export const useGetBarbersWithServices = (): UseQueryResult<
  BarberWithServices[],
  Error
> => {
  return useQuery({
    queryKey: BARBERS_WITH_SERVICES_QUERY_KEY,
    queryFn: async () => await getAllBarbersWithResolvedServices(),
    staleTime: 5 * 60 * 1000,
  });
};

export const useUpdateBarber = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateBarber,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: QUERY_KEY }),
  });
};

interface DeleteBarberPayload {
  id: string;
  deleteAll: boolean;
}

export const useDeleteBarber = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id }: DeleteBarberPayload) => deleteBarber(id),
    onSuccess: () => {
      queryClient.refetchQueries({ queryKey: ["barbers"] }); // adjust if needed
    },
  });
};

export const useGetBarberById = ({
  barberId,
  enable,
  getByUserid,
}: {
  barberId?: string;
  enable?: boolean;
  getByUserid?: string;
}): UseQueryResult<Barber, Error> => {
  console.log(enable);
  return useQuery({
    queryKey: ["barber", barberId, getBarberById],
    queryFn: () => getBarberById(barberId, getByUserid),
  });
};
// Optional combined hook
export const useBarbers = () => {
  const getQuery = useGetBarbers();
  const update = useUpdateBarber();
  const barbersWithservices = useGetBarbersWithServices();
  const addService = useAddServiceToBarber();
  const removeService = useRemoveServiceFromBarber();
  return {
    barbers: getQuery.data || [],
    isLoading: getQuery.isLoading,
    isError: getQuery.isError,
    error: getQuery.error,
    refetch: getQuery.refetch,

    barbersWithServices: barbersWithservices.data || [],
    isLoadingbarbersWithServices: barbersWithservices.isLoading,
    isErrorBarbersWithServices: barbersWithservices.isError,
    errorBarbersWithServices: barbersWithservices.error,
    refetchBarbersWithServices: barbersWithservices.refetch,

    addServiceToBarber: addService.mutate,
    addServiceToBarberAsync: addService.mutateAsync,
    isAddingService: addService.isPending,
    addServiceError: addService.error,

    removeServiceToBarber: removeService.mutate,
    removeServiceToBarberAsync: removeService.mutateAsync,
    isremoveingService: removeService.isPending,
    removeServiceError: removeService.error,

    updateBarber: update.mutate,
    updateBarberAsync: update.mutateAsync,
    isUpdating: update.isPending,
    updateError: update.error,
  };
};
