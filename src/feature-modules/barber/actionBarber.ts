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
  deleteDoc,
  DocumentData,
  QuerySnapshot,
  DocumentReference,
  setDoc,
  limit,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import {} from "firebase/firestore";
import { createBarberSchema, DayOfWeek, CreateBarberInput } from "./schema";
import { revalidatePath } from "next/cache";
import { COLLECTION_NAME } from "./hook.ts/useBarberApi";
import { Barber, BarberWithServices, DayOffEntry, Service } from "./type";
import { AvailabilityData } from "./CreateBarberDashboardpage";
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

    const servicesJson = formData.get("services") as string;
    const selectedServiceIds: string[] = servicesJson
      ? JSON.parse(servicesJson)
      : [];

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
      phone: userData.phone || null,
      bio: validatedInput.bio || null,
      description: validatedInput.description,
      experience: validatedInput.experience || null,
      profileImage:
        validatedInput.profileImage || userData.profileImage || null,
      rating: 0,
      totalBookings: 0,
      reviewCount: 0,
      isActive: true,
      isVerified: false,
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

    // Add selected services as subcollection (keeping this as subcollection)
    for (const serviceId of selectedServiceIds) {
      const serviceRef = doc(
        collection(db, "barbers", validatedInput.userId, "services"),
        serviceId
      );

      batch.set(serviceRef, {
        service: doc(db, "services", serviceId),
        createdAt: Timestamp.now(),
      });
    }

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
  const barberCollection = collection(db, COLLECTION_NAME);
  const q = limt ? query(barberCollection, limit(limt)) : barberCollection;

  const querySnapshot: QuerySnapshot<DocumentData> = await getDocs(q);

  return querySnapshot.docs.map(
    (doc) =>
      ({
        id: doc.id,
        ...doc.data(),
      } as Barber)
  );
};
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
      id: barberId,
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

const deleteBarber = async (id: string): Promise<void> => {
  const docRef = doc(db, COLLECTION_NAME, id);
  await deleteDoc(docRef);
};
// add server and remove
const addServiceToBarber = async ({
  barberId,
  serviceId,
}: {
  barberId: string;
  serviceId: string;
}) => {
  const serviceRef = doc(db, "services", serviceId);
  const barberServiceRef = doc(db, "barbers", barberId, "services", serviceId);

  await setDoc(barberServiceRef, {
    service: serviceRef,
    createdAt: new Date(),
  });
};

const removeServiceFromBarber = async ({
  barberId,
  serviceId,
}: {
  barberId: string;
  serviceId: string;
}) => {
  const barberServiceRef = doc(db, "barbers", barberId, "services", serviceId);
  await deleteDoc(barberServiceRef);
};
const getBarberById = async (barberId: string): Promise<Barber> => {
  const docRef = doc(db, COLLECTION_NAME, barberId);
  const docSnap = await getDoc(docRef);

  if (!docSnap.exists()) {
    throw new Error("Barber not found");
  }

  return {
    id: docSnap.id,
    ...(docSnap.data() as Barber),
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

const updateAvailability = async ({
  barberId,
  data,
}: {
  data: AvailabilityData[];
  barberId: string;
}): Promise<void> => {
  const now = new Date();

  const transformed = data.map((item) => {
    const [fromHour, fromMinute] = item.from.split(":").map(Number);
    const [toHour, toMinute] = item.to.split(":").map(Number);

    const startDate = new Date(now);
    startDate.setHours(fromHour, fromMinute, 0, 0);

    const endDate = new Date(now);
    endDate.setHours(toHour, toMinute, 0, 0);

    return {
      dayOfWeek: item.day.toUpperCase(),
      isEnabled: item.enabled,
      startTime: Timestamp.fromDate(startDate),
      endTime: Timestamp.fromDate(endDate),
      updatedAt: Timestamp.now(),
    };
  });

  const barberRef = doc(db, "barbers", barberId);
  await updateDoc(barberRef, {
    availability: transformed,
    updatedAt: Timestamp.now(),
  });
};
const addDayOff = async ({
  barberId,
  data,
}: {
  data: DayOffEntry[];
  barberId: string;
}): Promise<void> => {
  const availabilityRef = doc(db, "barbers", barberId);
  await updateDoc(availabilityRef, { dayOff: data });
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
  addDayOff,
  updateBarberProfile,
};
