import { db } from "@/lib/firebase";
import {
  addDoc,
  collection,
  doc,
  getDoc,
  limit,
  serverTimestamp,
  Timestamp,
  updateDoc,
} from "firebase/firestore";
import { Service } from "../barber/type";
import {
  getDocs,
  orderBy,
  query,
  QueryConstraint,
  where,
} from "firebase/firestore";
import { Review } from "./type";
import { deleteDoc } from "firebase/firestore";
export const updateAppointment = async (
  id: string,
  updates: {
    service?: Service;
    date: Date;
    startTime: string;
  }
) => {
  if (!id) throw new Error("Missing appointment ID");

  const timeStr = convertTo24Hr(updates?.startTime || "00:00");
  const startTime = new Date(
    `${updates?.date.toISOString().split("T")[0]}T${timeStr}`
  );
  const ref = doc(db, "appointments", id);
  await updateDoc(ref, {
    ...(updates.service && { service: updates.service }),
    ...(updates.date && { date: Timestamp.fromDate(updates.date) }),
    ...(updates.startTime && { startTime: Timestamp.fromDate(startTime) }),
  });
};

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
export const submitReview = async ({
  userName,
  userEmail,
  rating,
  reviewMessage,
  userId,
  barberId,
  barberEmail,
  barberName,
  appointmentID,
}: {
  userName: string;
  userEmail: string;
  rating: number;
  reviewMessage: string;
  userId: string;
  barberId: string;
  barberEmail: string;
  appointmentID: string;
  barberName: string;
}) => {
  const reviewRef = collection(db, "reviews");
  // Get barber by id and update rating and reviewCount
  // Update the appointment to set isBlocked to true
  if (appointmentID) {
    const appointmentRef = doc(db, "appointments", appointmentID);
    await updateDoc(appointmentRef, { isBlocked: true });
  }
  const barberRef = doc(db, "barbers", barberId);
  const barberSnap = await getDoc(barberRef);
  if (barberSnap.exists()) {
    const barberData = barberSnap.data();
    const prevRating = barberData.rating || 0;
    const prevCount = barberData.reviewCount || 0;
    const newCount = prevCount + 1;
    const newRating = (prevRating * prevCount + rating) / newCount;
    await updateDoc(barberRef, {
      rating: newRating,
      reviewCount: newCount,
    });
  }
  return await addDoc(reviewRef, {
    userName,
    userEmail,
    rating,
    reviewMessage,
    userId,
    barberId,
    barberEmail,
    appointmentID,
    status: "pending",
    barberName,
    createdAt: serverTimestamp(),
  });
};

export async function fetchReviews(filters: {
  userId?: string;
  barberId?: string;
  isAll?: boolean;
  status?: "pending" | "accept" | "reject";
  limit?: number;
}): Promise<Review[]> {
  console.log("fethck data review");
  const constraints: QueryConstraint[] = [orderBy("createdAt", "desc")];
  if (filters.limit && filters.limit > 0) {
    constraints.push(limit(filters.limit));
  }

  if (filters.userId) {
    constraints.push(where("userId", "==", filters.userId));
    constraints.push(where("status", "==", filters.status));
  }
  if (filters.barberId) {
    constraints.push(where("barberId", "==", filters.barberId));
    constraints.push(where("status", "==", "accept"));
  }

  const snap = await getDocs(query(collection(db, "reviews"), ...constraints));

  return snap.docs.map((d) => {
    const data = d.data();
    return {
      id: d.id,
      userId: data.userId,
      barberId: data.barberId,
      rating: data.rating,
      createdAt: data.createdAt?.toDate?.() ?? new Date(), // Timestamp → Date
      barberEmail: data?.barberEmail,
      barberName: data.barberName,
      reviewMessage: data.reviewMessage,
      userEmail: data.userEmail,
      userName: data.userName,
      status: data.status,
    } satisfies Review;
  });
}

export async function updateReviewStatus(
  reviewId: string,
  status: "accept" | "reject"
) {
  if (!reviewId) throw new Error("Missing review ID");
  if (!["accept", "reject"].includes(status)) throw new Error("Invalid status");
  const reviewRef = doc(db, "reviews", reviewId);
  if (status === "reject") {
    await deleteDoc(reviewRef);
  } else {
    await updateDoc(reviewRef, { status });
  }
}
