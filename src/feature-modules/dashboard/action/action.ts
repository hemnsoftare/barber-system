// actions/messages.actions.ts
import {
  collection,
  getDocs,
  query,
  where,
  orderBy,
  doc,
  updateDoc,
  FirestoreDataConverter,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

export interface BarberMessage {
  id: string;
  userId: string;
  email: string;
  fullName: string;
  message: string;
  read: boolean;
  timestamp: Date;
}

type FetchFilter = { scope: "all" } | { scope: "barber"; userId: string };
type MarkFilter =
  | { scope: "all" }
  | { scope: "barber"; userId: string }
  | { scope: "message"; id: string };

const converter: FirestoreDataConverter<BarberMessage> = {
  toFirestore: (d) => d,
  fromFirestore: (snap) => {
    const data = snap.data() as Omit<BarberMessage, "id">;
    return {
      ...data,
      id: snap.id,
    };
  },
};

export async function fetchMessages(filter: FetchFilter) {
  const base = collection(db, "messages").withConverter(converter);
  const q =
    filter.scope === "barber"
      ? query(
          base,
          where("userId", "==", filter.userId),
          orderBy("timestamp", "desc")
        )
      : query(base, orderBy("timestamp", "desc"));

  const snap = await getDocs(q);
  return snap.docs.map((d) => d.data());
}

export async function markMessagesRead(filter: MarkFilter) {
  const base = collection(db, "messages").withConverter(converter);
  if (filter.scope === "message") {
    await updateDoc(doc(base, filter.id), { read: true });
    return;
  }
  const q =
    filter.scope === "barber"
      ? query(
          base,
          where("userId", "==", filter.userId),
          where("read", "==", false)
        )
      : query(base, where("read", "==", false));
  const snap = await getDocs(q);
  await Promise.all(snap.docs.map((d) => updateDoc(d.ref, { read: true })));
}
