// utils/sendNotification.ts
import { db } from "@/lib/firebase";
import {
  addDoc,
  collection,
  getDocs,
  orderBy,
  query,
  Timestamp,
  where,
} from "firebase/firestore";
import { Notification } from "../type/type";

export async function sendNotification({
  userId,
  barberId,
  appointmentId,
  type,
  title,
  message,
}: Omit<Notification, "id" | "read" | "createdAt">): Promise<void> {
  await addDoc(collection(db, "notifications"), {
    userId,
    barberId,
    type,
    title,
    message,
    appointmentId: appointmentId || null,
    read: false,
    createdAt: Timestamp.now(),
  });
}
export async function getNotifications({
  userId,
  barberId,
}: {
  userId?: string;
  barberId?: string;
}): Promise<Notification[]> {
  let q = query(collection(db, "notifications"), orderBy("createdAt", "desc"));

  if (userId !== "all") {
    q = query(
      collection(db, "notifications"),
      where("userId", "==", userId),
      orderBy("createdAt", "desc")
    );
  } else if (barberId !== "all") {
    q = query(
      collection(db, "notifications"),
      where("barberId", "==", barberId),
      orderBy("createdAt", "desc")
    );
  }

  const snap = await getDocs(q);
  return snap.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Notification[];
}
