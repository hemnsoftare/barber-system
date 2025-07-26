// lib/actions/favorites.ts
import { db } from "@/lib/firebase";
import {
  addDoc,
  collection,
  deleteDoc,
  getDocs,
  query,
  serverTimestamp,
  where,
} from "firebase/firestore";

export const addFavorite = async (item: {
  userId: string;
  imageId: string;
  imageUrl: string;
}) => {
  await addDoc(collection(db, "favorites"), {
    ...item,
    createdAt: serverTimestamp(),
  });
};
export const removeFavorite = async (userId: string, imageId: string) => {
  const q = query(
    collection(db, "favorites"),
    where("userId", "==", userId),
    where("imageId", "==", imageId)
  );
  const snap = await getDocs(q);
  for (const doc of snap.docs) {
    await deleteDoc(doc.ref);
  }
};
