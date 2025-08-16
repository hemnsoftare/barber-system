import { COLLECTION_NAME } from "../hook.ts/useSerices";
import {
  collection,
  doc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  DocumentData,
  QuerySnapshot,
  limit as limitFn,
  query,
} from "firebase/firestore";
import { Service, ServiceData } from "../type/type";
import { db } from "@/lib/firebase";
const getServices = async ({ limt }: { limt?: number }): Promise<Service[]> => {
  const baseQuery = limt
    ? query(collection(db, COLLECTION_NAME), limitFn(limt))
    : collection(db, COLLECTION_NAME);

  const querySnapshot: QuerySnapshot<DocumentData> = await getDocs(baseQuery);

  return querySnapshot.docs.map(
    (doc) =>
      ({
        id: doc.id,
        ...doc.data(),
      } as Service)
  );
};

const createService = async (serviceData: ServiceData): Promise<string> => {
  const docRef = await addDoc(collection(db, COLLECTION_NAME), serviceData);
  return docRef.id;
};

const updateService = async ({
  id,
  data,
}: {
  id: string;
  data: Partial<ServiceData>;
}): Promise<void> => {
  const docRef = doc(db, COLLECTION_NAME, id);
  await updateDoc(docRef, data);
};

const deleteService = async (id: string): Promise<void> => {
  const docRef = doc(db, COLLECTION_NAME, id);
  await deleteDoc(docRef);
};

export { deleteService, updateService, createService, getServices };
