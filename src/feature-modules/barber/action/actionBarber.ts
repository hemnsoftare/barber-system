"use server";

import {
  doc,
  getDoc,
  collection,
  writeBatch,
  Timestamp,
  query,
  where,
  getDocs,
  updateDoc,
  DocumentReference,
  limit,
  arrayRemove,
  arrayUnion,
  deleteDoc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import {
  createBarberSchema,
  DayOfWeek,
  CreateBarberInput,
} from "../type/schema";
import { revalidatePath } from "next/cache";
import { COLLECTION_NAME } from "../hook.ts/useBarberApi";
import { Barber, BarberWithServices, Service } from "../type/type";
import { sendNotification } from "../../booking/action/actionNotifcation";
import { AppointmentProps } from "../../booking/action/action";
import { sendEmail } from "@/hook/useSendEmail";
const dayMap: Record<string, DayOfWeek> = {
  Sunday: DayOfWeek.SUNDAY,
  Monday: DayOfWeek.MONDAY,
  Tuesday: DayOfWeek.TUESDAY,
  Wednesday: DayOfWeek.WEDNESDAY,
  Thursday: DayOfWeek.THURSDAY,
  Friday: DayOfWeek.FRIDAY,
  Saturday: DayOfWeek.SATURDAY,
};

// Helper function to convert time string to Date
function timeStringToDateTime(timeString: string): Date {
  const [hours, minutes] = timeString.split(":").map(Number);
  const date = new Date();
  date.setHours(hours, minutes, 0, 0);
  return date;
}

async function createBarberAction(formData: FormData) {
  try {
    const userId = formData.get("userId") as string;
    const description = formData.get("description") as string;
    const bio = formData.get("bio") as string;
    const experience = formData.get("experience")
      ? Number(formData.get("experience"))
      : undefined;
    const profileImage = formData.get("profileImage") as string;

    // Build availability array instead of separate documents
    // Build availability array in the format expected by the schema
    const availabilities = [];
    const days = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];

    for (const day of days) {
      const enabled = formData.get(`${day}_enabled`) === "true";
      const from = formData.get(`${day}_from`) as string;
      const to = formData.get(`${day}_to`) as string;

      availabilities.push({
        day: dayMap[day], // Use 'day' to match schema
        enabled,
        from: enabled && from ? from : undefined,
        to: enabled && to ? to : undefined,
      });
    }

    const input: CreateBarberInput = {
      userId,
      description,
      bio: bio || undefined,
      experience,
      profileImage: profileImage || undefined,
      availabilities, // This matches the input schema format
    };

    const validatedInput = createBarberSchema.parse(input);

    // Convert availabilities to Firestore format after validation
    const firestoreAvailabilities = validatedInput.availabilities.map(
      (avail) => ({
        dayOfWeek: avail.day,
        isEnabled: avail.enabled,
        startTime:
          avail.enabled && avail.from ? timeStringToDateTime(avail.from) : null,
        endTime:
          avail.enabled && avail.to ? timeStringToDateTime(avail.to) : null,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      })
    );

    const existingBarberDoc = await getDoc(
      doc(db, "barbers", validatedInput.userId)
    );

    if (existingBarberDoc.exists()) {
      return {
        success: false,
        error: "This user already has a barber profile",
      };
    }

    const userQuery = query(
      collection(db, "users"),
      where("id", "==", validatedInput.userId)
    );
    const userQuerySnapshot = await getDocs(userQuery);

    if (userQuerySnapshot.empty) {
      return {
        success: false,
        error:
          "User not found. Please ensure the user exists before creating a barber profile.",
      };
    }

    const userData = userQuerySnapshot.docs[0].data();
    console.log("Creating barber profile for user:", userData);

    const batch = writeBatch(db);

    const barberRef = doc(db, "barbers", validatedInput.userId);
    const barberData = {
      userId: validatedInput.userId,
      fullName: userData.fullName || null,
      email: userData.email || null,
      description: validatedInput.description,
      experience: validatedInput.experience || 0,
      profileImage: userData.image || null,
      rating: 0,
      totalBookings: 0,
      reviewCount: 0,
      // Store availability as an array in the main document
      availability: firestoreAvailabilities,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };

    batch.set(barberRef, barberData);

    const userRef = doc(db, "users", validatedInput.userId);
    batch.update(userRef, {
      role: "barber",
      updatedAt: Timestamp.now(),
    });

    await batch.commit();

    const createdBarberDoc = await getDoc(barberRef);
    const result = {
      id: createdBarberDoc.id,
      ...createdBarberDoc.data(),
    };

    revalidatePath("/dashboard/barbers");

    console.log("Barber profile created successfully:", result);

    return {
      success: true,
      data: result,
      message: "Barber profile created successfully",
    };
  } catch (error) {
    console.error("Error creating barber:", error);

    if (error instanceof Error) {
      return {
        success: false,
        error: error.message,
      };
    }

    return {
      success: false,
      error: "An unexpected error occurred while creating barber profile",
    };
  }
}

// Firestore functions

const getBarbers = async ({ limt }: { limt?: number } = {}): Promise<
  Barber[]
> => {
  const barberCollection = collection(db, "barbers");
  const q = limt ? query(barberCollection, limit(limt)) : barberCollection;
  const querySnapshot = await getDocs(q);

  return querySnapshot.docs.map((doc) => {
    const raw = doc.data();

    const availability = (raw.availability ?? []).map(
      (entry: {
        dayOfWeek: string;
        isEnabled: boolean;
        startTime: Timestamp;
        endTime: Timestamp;
        createdAt?: Timestamp;
        updatedAt?: Timestamp;
      }) => ({
        dayOfWeek: entry.dayOfWeek,
        isEnabled: entry.isEnabled,
        startTime: convertToTime(entry.startTime),
        endTime: convertToTime(entry.endTime),
        createdAt: entry.createdAt
          ? convertToDateTime(entry.createdAt)
          : undefined,
        updatedAt: entry.updatedAt
          ? convertToDateTime(entry.updatedAt)
          : undefined,
      })
    );

    const offDays = (raw.offDays ?? []).map(
      (entry: {
        date: Timestamp;
        wholeDay: boolean;
        from?: string | null;
        to?: string | null;
      }) => ({
        date: entry.date.toDate(), // 🔁 FIX: convert Timestamp to Date
        wholeDay: entry.wholeDay,
        from: entry.from ?? null,
        to: entry.to ?? null,
      })
    );
    return {
      id: doc.id,
      userId: raw.userId,
      fullName: raw.fullName,
      email: raw.email,
      phone: raw.phone,
      profileImage: raw.profileImage,
      experience: raw.experience,
      description: raw.description,
      rating: raw.rating,
      reviewCount: raw.reviewCount,
      totalBookings: raw.totalBookings,
      isVerified: raw.isVerified,
      isActive: raw.isActive,
      bio: raw.bio ?? null,
      createdAt: convertToDateTime(raw.createdAt),
      updatedAt: convertToDateTime(raw.updatedAt),
      availability,
      dayOff: offDays,
      serviceIds: raw.serviceIds,
    };
  });
};
const convertToTime = (ts: Timestamp | null | undefined): string => {
  if (!ts || typeof ts.toDate !== "function") return "";
  const date = ts.toDate();
  return `${date.getHours().toString().padStart(2, "0")}:${date
    .getMinutes()
    .toString()
    .padStart(2, "0")}`;
};

const convertToDateTime = (ts: Timestamp | null | undefined): string => {
  if (!ts || typeof ts.toDate !== "function") return "";
  const date = ts.toDate();
  const yyyyMMdd = date.toISOString().split("T")[0];
  const hhmm = `${date.getHours().toString().padStart(2, "0")}:${date
    .getMinutes()
    .toString()
    .padStart(2, "0")}`;
  return `${yyyyMMdd} ${hhmm}`;
};

// ⏰ "HH:MM"

// 📅 "YYYY-MM-DD"

// 📅 "YYYY-MM-DD HH:MM"

//
//
//
//
//

const getAllBarbersWithResolvedServices = async (): Promise<
  BarberWithServices[]
> => {
  const barbersSnapshot = await getDocs(collection(db, "barbers"));
  const barbers: BarberWithServices[] = [];

  for (const barberDoc of barbersSnapshot.docs) {
    const barberData = barberDoc.data() as Barber;
    const barberId = barberDoc.id;

    // Step 1: Get barber’s service links
    const serviceLinksSnapshot = await getDocs(
      collection(db, `barbers/${barberId}/services`)
    );

    // Step 2: Fetch actual service documents via reference
    // Step 2: Fetch actual service documents via reference
    const services: Service[] = [];

    for (const serviceLinkDoc of serviceLinksSnapshot.docs) {
      const serviceRef = serviceLinkDoc.data().service as DocumentReference;

      if (serviceRef) {
        const serviceDoc = await getDoc(serviceRef);
        if (serviceDoc.exists()) {
          const serviceData = serviceDoc.data() as Omit<Service, "id">;
          services.push({
            id: serviceDoc.id,
            ...serviceData,
          });
        }
      }
    }

    barbers.push({
      ...barberData,
      services,
    });
  }
  return barbers;
};

const updateBarber = async ({
  id,
  data,
}: {
  id: string;
  data: Partial<{
    description: string;
    profileImage: string;
    experience: number;
  }>;
}): Promise<void> => {
  const docRef = doc(db, COLLECTION_NAME, id);
  await updateDoc(docRef, data);
};

export type EmailPayload = {
  to: string;
  from?: string; // default later
  subject: string;
  message: string;
  html?: string;
};

async function deleteBarber(barberId: string): Promise<void> {
  /* ── 1. Get barber info ─────────────────────────────────────── */
  const barberRef = doc(db, "barbers", barberId);
  const barberSnap = await getDoc(barberRef);
  if (!barberSnap.exists()) throw new Error("Barber not found");
  const barber = barberSnap.data() as Barber;

  const batch = writeBatch(db);

  /* ── 2. Appointments ────────────────────────────────────────── */

  /* ── 3. Reviews (always delete) ─────────────────────────────── */
  const notifSnap = await getDocs(
    query(collection(db, "notifications"), where("barberId", "==", barberId))
  );
  notifSnap.forEach((d) => batch.delete(d.ref));

  const reviewSnap = await getDocs(
    query(collection(db, "reviews"), where("barberId", "==", barberId))
  );
  reviewSnap.forEach((d) => batch.delete(d.ref));

  /* ── 4. Delete barber doc itself ────────────────────────────── */
  batch.delete(barberRef);
  await batch.commit();

  /* ── 5. Notify + e-mail each client with cancelled appt ─────── */

  /* ── 6. Final e-mail + in-app noti to the barber ────────────── */
  await Promise.all([
    sendEmail({
      to: barber.email,
      subject: "Your barber account was deleted",
      emailUser: "",
      from: "",
      message: `Dear ${barber.fullName}, Your barber account has been permanently removed from the platform. If you believe this is a mistake or wish to rejoin in the future, please contact support.Thank you for the time you spent with us.— The Barber-Booking Platform Team`,
    }),
    sendNotification({
      userId: barberId, // or a system-level ID if barbers aren’t “users”
      barberId,
      appointmentId: "",
      type: "delete_barber",
      title: "Account Deleted",
      message:
        "Your barber account has been removed and is no longer visible on the platform.",
    }),
  ]);
}

//
//
//
//
//
// add server and remove
const addServiceToBarber = async ({
  barberId,
  serviceId,
}: {
  barberId: string;
  serviceId: string;
}) => {
  const barberRef = doc(db, "barbers", barberId);
  await updateDoc(barberRef, {
    serviceIds: arrayUnion(serviceId),
  });
};
const removeServiceFromBarber = async ({
  barberId,
  serviceId,
  serviceName,
  barberName,
  barberEmail,
}: {
  barberId: string;
  serviceId: string;
  serviceName: string;
  barberName: string;
  barberEmail: string;
}) => {
  const barberRef = doc(db, "barbers", barberId);
  console.log(barberName, serviceName, barberEmail);
  // 🔥 1. Remove from barber.serviceIds
  await updateDoc(barberRef, {
    serviceIds: arrayRemove(serviceId),
  });

  // 🔥 2. Get all "not-finished" appointments for this barber
  const appointmentsRef = collection(db, "appointments");
  const q = query(
    appointmentsRef,
    where("barber.id", "==", barberId),
    where("service.id", "==", serviceId),
    where("status", "==", "not-finished")
  );
  const snapshot = await getDocs(q);

  // 🔥 3. Process each appointment
  for (const docSnap of snapshot.docs) {
    const appointment = docSnap.data() as AppointmentProps;
    const appointmentId = docSnap.id;
    console.log(appointment);
    // 🧨 Delete the appointment
    await deleteDoc(doc(db, "appointments", appointmentId));

    // 📬 Notify and email the user
    const userId = appointment.user.id;
    await sendNotification({
      userId: userId || "",
      barberId,
      appointmentId,
      type: "cancelled-admin",
      title: "Your appointment was canceled",
      message: `The service you booked was removed. Please rebook with another service.`,
    });

    await sendEmail({
      to: appointment.user.email || "",
      subject: "Appointment Cancelled",
      emailUser: appointment?.barber?.barberEmail || " ",
      from: "barbersystem72@gmail.com",
      html: `
      <div style="background: #fff; border: 2px solid #480024; border-radius: 12px; padding: 24px; max-width: 540px; margin: 0 auto;">
        <h2 style="color: #480024; margin-bottom: 16px;">Heads up!</h2>
        <p style="font-size: 16px; color: #333; line-height: 1.6;">
          Hey ${appointment.user.fullName ?? "there"},
        </p>
        <p style="font-size: 16px; color: #333; line-height: 1.6;">
          We're sorry – the service <strong>${serviceName}</strong> has been removed,
          so your appointment with <strong>${barberName}</strong> was cancelled.
        </p>
        <p style="font-size: 16px; color: #333; line-height: 1.6;">
          Please choose an alternative service and re-book at your convenience.
        </p>
        <div style="text-align: center; margin-top: 24px;">
          <p
             style="background-color: #480024; color: #fff; padding: 12px 20px;
                    border-radius: 8px; text-decoration: none; display: inline-block;
                    font-weight: bold;">
            Rebook Now
          </p>
        </div>
      </div>
    `,
      message: `Hey there, your appointment with ${appointment.barber.fullName} was canceled because the service was removed. Please rebook using a different service.`,
    });
  }

  // 📬 Final message to the barber
  await sendNotification({
    userId: "userId", // or notifyBarberId if separated
    barberId,
    type: "remove-service",
    title: "Services Removed",
    message: `Your service (${serviceId}) has been removed, and related appointments were canceled.`,
  });

  await sendEmail({
    to: barberEmail, // Get this from the barber record ideally
    subject: "Services Removed",
    from: "barbersystem72@gmail.com",
    emailUser: "barbersystem72@gmail.com",
    message: "barbersystem72@gmail.com",
    html: ` <div style="background: #fff; border: 2px solid #480024; border-radius: 12px; padding: 24px; max-width: 540px; margin: 0 auto;">
      <h2 style="color: #480024; margin-bottom: 16px;">Service Removed</h2>
      <p style="font-size: 16px; color: #333; line-height: 1.6;">
        Hello ${barberName},
      </p>
      <p style="font-size: 16px; color: #333; line-height: 1.6;">
        We wanted to inform you that your service <strong>${serviceName}</strong> has been removed from the platform.
      </p>
      <p style="font-size: 16px; color: #333; line-height: 1.6;">
        All unfinished appointments tied to this service have been cancelled and your clients have been notified.
      </p>
      <p style="font-size: 16px; color: #333; line-height: 1.6;">
        You can review or update your available services in your dashboard at any time.
      </p>
      <div style="text-align: center; margin-top: 24px;">
        <p 
           style="background-color: #480024; color: #fff; padding: 12px 20px;
                  border-radius: 8px; text-decoration: none; display: inline-block;
                  font-weight: bold;">
          Manage Services
        </p>
      </div>
    </div>
  `,
  });
};

const getBarberById = async (
  barberId?: string,
  getByUserid?: string
): Promise<Barber> => {
  let docSnap;
  console.log("barberid");
  console.log(barberId);
  console.log("userid");
  console.log(getByUserid);
  // ─── 1️⃣ Fetch by doc ID ────────────────────────────────────────
  if (barberId) {
    docSnap = await getDoc(doc(db, COLLECTION_NAME, barberId));
    if (!docSnap.exists()) throw new Error("Barber not found");
  }

  // ─── 2️⃣ Fetch by userId field ──────────────────────────────────
  else {
    const q = query(
      collection(db, COLLECTION_NAME),
      where("userId", "==", getByUserid),
      limit(1)
    );
    const snap = await getDocs(q);
    if (snap.empty) throw new Error();
    docSnap = snap.docs[0];
  }
  const raw = docSnap.data();
  if (!docSnap.exists()) {
    throw new Error("Barber not found");
  }
  const availability = (raw?.availability ?? []).map(
    (entry: {
      dayOfWeek: string;
      isEnabled: boolean;
      startTime: Timestamp;
      endTime: Timestamp;
      createdAt?: Timestamp;
      updatedAt?: Timestamp;
    }) => ({
      dayOfWeek: entry.dayOfWeek,
      isEnabled: entry.isEnabled,
      startTime: convertToTime(entry.startTime),
      endTime: convertToTime(entry.endTime),
      createdAt: entry.createdAt
        ? convertToDateTime(entry.createdAt)
        : undefined,
      updatedAt: entry.updatedAt
        ? convertToDateTime(entry.updatedAt)
        : undefined,
    })
  );

  const offDays = (raw?.offDays ?? []).map(
    (entry: {
      date: Timestamp;
      wholeDay: boolean;
      from?: string | null;
      to?: string | null;
    }) => ({
      date: entry.date.toDate(), // 🔁 FIX: convert Timestamp to Date
      wholeDay: entry.wholeDay,
      from: entry.from ?? null,
      to: entry.to ?? null,
    })
  );

  return {
    id: docSnap.id,
    userId: raw?.userId,
    fullName: raw?.fullName,
    email: raw?.email,
    phone: raw?.phone,
    profileImage: raw?.profileImage,
    experience: raw?.experience,
    description: raw?.description,
    rating: raw?.rating,
    reviewCount: raw?.reviewCount,
    totalBookings: raw?.totalBookings,
    isVerified: raw?.isVerified,
    isActive: raw?.isActive,
    bio: raw?.bio ?? null,
    createdAt: convertToDateTime(raw?.createdAt),
    updatedAt: convertToDateTime(raw?.updatedAt),
    availability,
    dayOff: offDays,
  };
};

const updateBarberProfile = async ({
  barberId,
  data,
}: {
  barberId: string;
  data: Pick<Barber, "profileImage" | "description" | "experience">;
}): Promise<void> => {
  const barberRef = doc(db, "barbers", barberId);
  await updateDoc(barberRef, data);
};

type AvailabilityData = {
  day: string;
  enabled: boolean;
  from: string;
  to: string;
};

interface Params {
  barberId: string;
  data: AvailabilityData[]; // UI state
  dataOld: AvailabilityData[]; // Firestore snapshot
}

const hm = (t: string): number => {
  // "11:30" → 690
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
};

// const updateAvailability = async ({
//   barberId,
//   data,
//   dataOld,
// }: Params): Promise<void> => {
//   const now = new Date();

//   /* 1️⃣  Detect disabled days */
//   const newlyDisabled = data
//     .filter((n) => {
//       const o = dataOld.find((p) => p.day === n.day);
//       return o?.enabled && !n.enabled;
//     })
//     .map((n) => n.day.toUpperCase());

//   /* 2️⃣  Detect shrunken time-windows */
//   type Shrink = { day: string; newStart: number; newEnd: number };
//   const shrunk: Shrink[] = [];

//   data.forEach((n) => {
//     const o = dataOld.find((p) => p.day === n.day);
//     if (o?.enabled && n.enabled) {
//       const oStart = hm(o.from);
//       const oEnd = hm(o.to);
//       const nStart = hm(n.from);
//       const nEnd = hm(n.to);

//       if (nStart > oStart || nEnd < oEnd) {
//         shrunk.push({
//           day: n.day.toUpperCase(),
//           newStart: nStart,
//           newEnd: nEnd,
//         });
//       }
//     }
//   });

//   /* 3️⃣  Transform for Firestore */
//   const transformed = data.map((item) => {
//     const start = new Date(now);
//     const end = new Date(now);
//     const [fh, fm] = item.from.split(":").map(Number);
//     const [th, tm] = item.to.split(":").map(Number);
//     start.setHours(fh, fm, 0, 0);
//     end.setHours(th, tm, 0, 0);

//     return {
//       dayOfWeek: item.day.toUpperCase(),
//       isEnabled: item.enabled,
//       startTime: Timestamp.fromDate(start),
//       endTime: Timestamp.fromDate(end),
//       updatedAt: Timestamp.now(),
//     };
//   });

//   /* 4️⃣  Commit new availability */
//   const batch = writeBatch(db);
//   const barberRef = doc(db, "barbers", barberId);

//   batch.update(barberRef, {
//     availability: transformed,
//     dayOffWeek: newlyDisabled,
//     updatedAt: Timestamp.now(),
//   });

//   /* 5️⃣  Cancel affected appointments */
//   const daysToInspect = [
//     ...new Set([...newlyDisabled, ...shrunk.map((s) => s.day)]),
//   ];

//   if (daysToInspect.length) {
//     // Query appointments for this barber that are not finished
//     const apptQ = query(
//       collection(db, "appointments"),
//       where("barber.id", "==", barberId),
//       where("status", "==", "not-finished")
//     );

//     const snap = await getDocs(apptQ);

//     snap.forEach(async (docSnap) => {
//       const appointmentData = docSnap.data() as AppointmentProps;
//       const dayOffWeek = appointmentData.dayOffWeek;

//       const appointmentDay = dayOffWeek[0];
//       const startTime: Timestamp = appointmentData.date as Timestamp;
//       const appointmentMinutes =
//         startTime.toDate().getHours() * 60 + startTime.toDate().getMinutes();

//       // a) Day was disabled outright
//       if (newlyDisabled.includes(appointmentDay)) {
//         console.log(`Deleting appointment on disabled day: ${appointmentDay}`);
//         batch.delete(docSnap.ref);
//         return;
//       }

//       // b) Day kept but window shrank
//       const shrinkRule = shrunk.find((s) => s.day === appointmentDay);
//       if (shrinkRule) {
//         const duration = appointmentData.service?.duration || 0;
//         const appointmentEnd = appointmentMinutes + duration;

//         // Delete if appointment starts before new start OR ends after new end
//         if (
//           appointmentMinutes < shrinkRule.newStart ||
//           appointmentEnd > shrinkRule.newEnd
//         ) {
//           const when = startTime.toDate().toLocaleString(); // keep this line

//           await sendNotification({
//             userId: appointmentData?.user.id || "",
//             barberId,
//             appointmentId: appointmentData?.id,
//             type: "cancelled-admin",
//             title: "Appointment Cancelled",
//             message: `Hi ${appointmentData?.user.fullName}, your appointment with ${appointmentData?.barber.fullName} on ${when} was cancelled because your barber's working hours changed and your appointment is now outside their new schedule.`,
//           });

//           await sendEmail({
//             to: appointmentData?.user?.email || "",
//             emailUser: "",
//             from: "no-reply@yourapp.com",
//             subject: "Your appointment has been cancelled",
//             message: "",
//             html: `
//                 <div style="max-width:600px;margin:auto;padding:20px;border:1px solid #eee;border-radius:12px;font-family:sans-serif;background-color:#f9f9f9;">
//                 <h2 style="color:#8b5cf6;">Appointment Cancelled</h2>
//                 <p>Dear <strong>${appointmentData?.user.fullName}</strong>,</p>

//                 <div style="border:1px solid #ddd;border-radius:10px;padding:16px;background:#fff;margin-top:16px;margin-bottom:16px;">
//                   <p style="margin:0;"><strong>Barber:</strong> ${appointmentData?.barber.fullName}</p>
//                   <p style="margin:0;"><strong>Service:</strong> ${appointmentData?.service?.name}</p>
//                   <p style="margin:0;"><strong>Date:</strong> ${when}</p>
//                 </div>

//                 <p>Unfortunately, your appointment has been cancelled because your barber's working hours changed and your appointment now falls outside of the new schedule.</p>

//                 <p>Please feel free to book another available time or choose a different barber.</p>

//                 <a href="https://yourbookingapp.com/reschedule" style="display:inline-block;margin-top:20px;padding:10px 20px;background-color:#8b5cf6;color:#fff;text-decoration:none;border-radius:8px;">Reschedule Now</a>

//                 <p style="margin-top:30px;">Best regards,<br>The Barber-Booking Team</p>
//                 </div>
//             `,
//           });

//           batch.delete(docSnap.ref);
//         }
//       }
//     });
//   }

//   await batch.commit();
// };
const updateAvailability = async ({
  barberId,
  data,
  dataOld,
}: Params): Promise<void> => {
  const now = new Date();

  /* 1️⃣  Detect disabled days */
  const newlyDisabled = data
    .filter((n) => {
      const o = dataOld.find((p) => p.day === n.day);
      return o?.enabled && !n.enabled;
    })
    .map((n) => n.day.toUpperCase());

  /* 2️⃣  Detect shrunken time-windows */
  type Shrink = { day: string; newStart: number; newEnd: number };
  const shrunk: Shrink[] = [];

  data.forEach((n) => {
    const o = dataOld.find((p) => p.day === n.day);
    if (o?.enabled && n.enabled) {
      const oStart = hm(o.from);
      const oEnd = hm(o.to);
      const nStart = hm(n.from);
      const nEnd = hm(n.to);

      if (nStart > oStart || nEnd < oEnd) {
        shrunk.push({
          day: n.day.toUpperCase(),
          newStart: nStart,
          newEnd: nEnd,
        });
      }
    }
  });

  /* 3️⃣  Transform for Firestore */
  const transformed = data.map((item) => {
    const start = new Date(now);
    const end = new Date(now);
    const [fh, fm] = item.from.split(":").map(Number);
    const [th, tm] = item.to.split(":").map(Number);
    start.setHours(fh, fm, 0, 0);
    end.setHours(th, tm, 0, 0);

    return {
      dayOfWeek: item.day.toUpperCase(),
      isEnabled: item.enabled,
      startTime: Timestamp.fromDate(start),
      endTime: Timestamp.fromDate(end),
      updatedAt: Timestamp.now(),
    };
  });

  /* 4️⃣  Commit new availability */
  const batch = writeBatch(db);
  const barberRef = doc(db, "barbers", barberId);

  batch.update(barberRef, {
    availability: transformed,
    dayOffWeek: newlyDisabled,
    updatedAt: Timestamp.now(),
  });

  /* 5️⃣  Cancel affected appointments */
  // const daysToInspect = [
  //   ...new Set([...newlyDisabled, ...shrunk.map((s) => s.day)]),
  // ];

  // if (daysToInspect.length) {
  //   // Query appointments for this barber that are not finished
  //   const apptQ = query(
  //     collection(db, "appointments"),
  //     where("barber.id", "==", barberId),
  //     where("status", "==", "not-finished")
  //   );

  //   const snap = await getDocs(apptQ);

  //   // Process each appointment sequentially to handle async operations properly
  //   for (const docSnap of snap.docs) {
  //     const appointmentData = docSnap.data() as AppointmentProps;
  //     const dayOffWeek = appointmentData.dayOffWeek;

  //     const appointmentDay = dayOffWeek[0];
  //     const startTime: Timestamp = appointmentData.date as Timestamp;
  //     const appointmentMinutes =
  //       startTime.toDate().getHours() * 60 + startTime.toDate().getMinutes();

  //     // a) Day was disabled outright
  //     if (newlyDisabled.includes(appointmentDay)) {
  //       console.log(`Deleting appointment on disabled day: ${appointmentDay}`);

  //       // Send notification and email for disabled day
  //       try {
  //         await sendNotification({
  //           userId: appointmentData?.user.id || "",
  //           barberId,
  //           appointmentId: appointmentData?.id,
  //           type: "cancelled-admin",
  //           title: "Appointment Cancelled",
  //           message: `Hi ${appointmentData?.user.fullName}, your appointment with ${appointmentData?.barber.fullName} was cancelled because your barber is no longer available on this day.`,
  //         });

  //         await sendEmail({
  //           to: appointmentData?.user?.email || "",
  //           emailUser: appointmentData?.user?.email || "",
  //           from: "no-reply@yourapp.com",
  //           subject: "Your appointment has been cancelled",
  //           message: `Hi ${appointmentData?.user.fullName}, your appointment has been cancelled because your barber is no longer available on this day.`,
  //           html: `
  //             <div style="max-width:600px;margin:auto;padding:20px;border:1px solid #eee;border-radius:12px;font-family:sans-serif;background-color:#f9f9f9;">
  //               <h2 style="color:#8b5cf6;">Appointment Cancelled</h2>
  //               <p>Dear <strong>${appointmentData?.user.fullName}</strong>,</p>

  //               <div style="border:1px solid #ddd;border-radius:10px;padding:16px;background:#fff;margin-top:16px;margin-bottom:16px;">
  //                 <p style="margin:0;"><strong>Barber:</strong> ${appointmentData?.barber.fullName}</p>
  //                 <p style="margin:0;"><strong>Service:</strong> ${appointmentData?.service?.name}</p>
  //               </div>

  //               <p>Unfortunately, your appointment has been cancelled because your barber is no longer available on this day.</p>

  //               <p>Please feel free to book another available time or choose a different barber.</p>

  //               <a href="https://yourbookingapp.com/reschedule" style="display:inline-block;margin-top:20px;padding:10px 20px;background-color:#8b5cf6;color:#fff;text-decoration:none;border-radius:8px;">Reschedule Now</a>

  //               <p style="margin-top:30px;">Best regards,<br>The Barber-Booking Team</p>
  //             </div>
  //           `,
  //         });

  //         console.log(
  //           `Notification and email sent for cancelled appointment on disabled day: ${appointmentData?.id}`
  //         );
  //       } catch (error) {
  //         console.error(
  //           `Failed to send notification/email for disabled day appointment ${appointmentData?.id}:`,
  //           error
  //         );
  //       }

  //       batch.delete(docSnap.ref);
  //       continue; // Move to next appointment
  //     }

  //     // b) Day kept but window shrank
  //     const shrinkRule = shrunk.find((s) => s.day === appointmentDay);
  //     if (shrinkRule) {
  //       const duration = appointmentData.service?.duration || 0;
  //       const appointmentEnd = appointmentMinutes + duration;

  //       // Delete if appointment starts before new start OR ends after new end
  //       if (
  //         appointmentMinutes < shrinkRule.newStart ||
  //         appointmentEnd > shrinkRule.newEnd
  //       ) {
  //         // const when = startTime.toDate().toLocaleString(); // keep this line
  //         const when = appointmentData?.date
  //           ? `${appointmentData.date.toDate().toLocaleDateString()} at ${
  //               appointmentData.startTime
  //                 ? appointmentData.startTime.toDate().toLocaleTimeString([], {
  //                     hour: "2-digit",
  //                     minute: "2-digit",
  //                   })
  //                 : "Unknown time"
  //             }`
  //           : "Unknown date";
  //         try {
  //           await sendNotification({
  //             userId: appointmentData?.user.id || "",
  //             barberId,
  //             appointmentId: appointmentData?.id,
  //             type: "cancelled-admin",
  //             title: "Appointment Cancelled",
  //             message: `Hi ${appointmentData?.user.fullName}, your appointment with ${appointmentData?.barber.fullName} on ${when} was cancelled because your barber's working hours changed and your appointment now falls outside of the new schedule.`,
  //           });

  //           await sendEmail({
  //             to: appointmentData?.user?.email || "",
  //             emailUser: appointmentData?.user?.email || "",
  //             from: "no-reply@yourapp.com",
  //             subject: "Your appointment has been cancelled",
  //             message: `Hi ${appointmentData?.user.fullName}, your appointment has been cancelled because your barber's working hours changed.`,
  //             html: `
  //               <div style="max-width:600px;margin:auto;padding:20px;border:1px solid #eee;border-radius:12px;font-family:sans-serif;background-color:#f9f9f9;">
  //                 <h2 style="color:#8b5cf6;">Appointment Cancelled</h2>
  //                 <p>Dear <strong>${appointmentData?.user.fullName}</strong>,</p>

  //                 <div style="border:1px solid #ddd;border-radius:10px;padding:16px;background:#fff;margin-top:16px;margin-bottom:16px;">
  //                   <p style="margin:0;"><strong>Barber:</strong> ${appointmentData?.barber.fullName}</p>
  //                   <p style="margin:0;"><strong>Service:</strong> ${appointmentData?.service?.name}</p>
  //                   <p style="margin:0;"><strong>Date:</strong> ${when}</p>
  //                 </div>

  //                 <p>Unfortunately, your appointment has been cancelled because your barber's working hours changed and your appointment now falls outside of the new schedule.</p>

  //                 <p>Please feel free to book another available time or choose a different barber.</p>

  //                 <a href="https://yourbookingapp.com/reschedule" style="display:inline-block;margin-top:20px;padding:10px 20px;background-color:#8b5cf6;color:#fff;text-decoration:none;border-radius:8px;">Reschedule Now</a>

  //                 <p style="margin-top:30px;">Best regards,<br>The Barber-Booking Team</p>
  //               </div>
  //             `,
  //           });

  //           console.log(
  //             `Notification and email sent for cancelled appointment due to time change: ${appointmentData?.id}`
  //           );
  //         } catch (error) {
  //           console.error(
  //             `Failed to send notification/email for time-changed appointment ${appointmentData?.id}:`,
  //             error
  //           );
  //         }

  //         batch.delete(docSnap.ref);
  //       }
  //     }
  //   }
  // }

  await batch.commit();
};
export {
  createBarberAction,
  getBarbers,
  getAllBarbersWithResolvedServices,
  updateBarber,
  deleteBarber,
  addServiceToBarber,
  removeServiceFromBarber,
  getBarberById,
  updateAvailability,
  updateBarberProfile,
};
