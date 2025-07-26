"use server";
import { db } from "@/lib/firebase";
// src/lib/actions/user.actions.ts
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  FirestoreDataConverter,
  getDoc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";
import { Notification, NotificationType } from "../booking/type";
import { User } from "./type";
import { Barber } from "../barber/type";

export async function addMessage({
  userId,
  email,
  fullName,
  message,
}: {
  userId: string;
  email: string;
  fullName: string;
  message: string;
}) {
  await addDoc(collection(db, "messages"), {
    userId,
    email,
    fullName,
    message,
    read: false,
    timestamp: serverTimestamp(),
  });
}

type Filter =
  | { scope: "all" }
  | { scope: "user"; userId: string }
  | { scope: "barber"; barberId: string };

const notificationConverter: FirestoreDataConverter<Notification> = {
  toFirestore: (n) => n,
  fromFirestore: (snap) => ({ id: snap.id, ...(snap.data() as Notification) }),
};
const getAllowedTypes = (filter: Filter): NotificationType[] => {
  //  | "booked"
  // | "cancelled-user"
  // | "cancelled-admin"
  // | "rescheduled"
  // | "finished"
  // | "review"
  // | "expired"
  // | "delete_barber"
  // | "remove-service"
  // | "message"
  // | "update-appointment"
  // | "message-to-user";
  switch (filter.scope) {
    case "user":
      return [
        "message-to-user",
        "expired",
        "finished",
        "message",
        "cancelled-admin",
        "remove-service",
        "update-appointment",
      ];
    case "barber":
      return [
        "review",
        "rescheduled",
        "cancelled-user",
        "booked",
        "delete_barber",
      ];
    default:
      return []; // no filter
  }
};

// ────────────────
// Build query
// ────────────────
const buildQuery = (filter: Filter) => {
  const base = collection(db, "notifications").withConverter(
    notificationConverter
  );

  switch (filter.scope) {
    case "user":
      return query(
        base,
        where("userId", "==", filter.userId),
        orderBy("createdAt", "desc")
      );
    case "barber":
      return query(
        base,
        where("barberId", "==", filter.barberId),
        orderBy("createdAt", "desc")
      );
    default:
      return query(base, orderBy("createdAt", "desc"));
  }
};

// ────────────────
// Main fetch function
// ────────────────
export const fetchNotifications = async (
  filter: Filter
): Promise<Notification[]> => {
  const snap = await getDocs(buildQuery(filter));
  const allNoti = snap.docs.map((doc) => doc.data());
  console.log(allNoti);
  if (filter.scope === "all") return allNoti;
  const allowed = getAllowedTypes(filter);
  const datallow = allNoti.filter((n) => allowed.includes(n.type));
  console.log("alllllllllllllllowwwwwwwwwwwwwwww");
  console.log(datallow);
  return datallow;
};

// ─── Filter type for mark-as-read ──────────────────────────
type MarkFilter =
  | { scope: "all" }
  | { scope: "notification"; id: string } // single doc
  | { scope: "user"; userId: string } // all docs for user
  | { scope: "barber"; barberId: string }; // all docs for barber

/**
 * Marks notifications as read, based on the given filter.
 */
const converter: FirestoreDataConverter<Notification> = {
  toFirestore: (n) => n,
  fromFirestore: (snap) => ({ id: snap.id, ...(snap.data() as Notification) }),
};
export const markNotificationsRead = async (filter: MarkFilter) => {
  const coll = collection(db, "notifications").withConverter(converter);

  // 1️⃣ Single-doc path ― fastest
  if (filter.scope === "notification") {
    await deleteDoc(doc(coll, filter.id));
    return;
  }

  // 2️⃣ Build query for multi-doc update
  let q;
  switch (filter.scope) {
    case "user":
      q = query(
        coll,
        where("userId", "==", filter.userId),
        where("read", "==", false)
      );
      break;
    case "barber":
      q = query(
        coll,
        where("barberId", "==", filter.barberId),
        where("read", "==", false)
      );
      break;
    default: // "all"
      q = query(coll, where("read", "==", false));
  }

  // 3️⃣ Fetch & batch-update
  const snap = await getDocs(q);
  const updates = snap.docs.map((d) => deleteDoc(d.ref));
  await Promise.all(updates);
};

/* ------------------------- Upsert (create / diff-update) ---------------- */
export async function upsertUser(user: User): Promise<User> {
  const ref = doc(db, "users", user.id); // 🔐 Clerk ID === doc ID
  const snap = await getDoc(ref);

  // Preserve original createdAt if the doc already exists
  const freshData: User = {
    ...user,
  };

  if (!snap.exists()) {
    /* ---------- 1️⃣ brand-new user ---------- */
    await setDoc(ref, freshData);
  } else {
    /* ---------- 2️⃣ update only changed fields ---------- */
    const curr = snap.data() as User;
    const diffs: Partial<User> = {};
    (["fullName", "email", "role", "barberId", "image"] as const).forEach(
      (k) => {
        if (curr[k] !== freshData[k]) diffs[k] = freshData[k];
      }
    );
    if (Object.keys(diffs).length) await updateDoc(ref, diffs);
    await syncBarberIfLinked(user);
  }

  return freshData;
}
// if ralataion with barber
async function syncBarberIfLinked(user: User) {
  const barbersRef = collection(db, "barbers");
  const q = query(barbersRef, where("userId", "==", user.id));
  const barberSnap = await getDocs(q);

  if (barberSnap.empty) return;

  for (const docSnap of barberSnap.docs) {
    const barberRef = doc(db, "barbers", docSnap.id);
    const existing = docSnap.data() as Barber;

    const diffs: Partial<Barber> = {};

    if (user.fullName !== existing.fullName) diffs.fullName = user.fullName;
    if (user.email !== existing.email) diffs.email = user.email;
    if (user.image !== existing.profileImage)
      diffs.profileImage = user.image ?? "";

    if (Object.keys(diffs).length) {
      diffs.updatedAt = new Date().toISOString(); // Optional update timestamp
      await updateDoc(barberRef, diffs);
    }
  }
}

export async function getNonCustomerUsers(): Promise<User[]> {
  const usersRef = collection(db, "users");

  const q = query(usersRef, where("role", "!=", "customer"));

  const snapshot = await getDocs(q);
  const users = snapshot.docs.map((doc) => doc.data() as User);

  return users;
}
