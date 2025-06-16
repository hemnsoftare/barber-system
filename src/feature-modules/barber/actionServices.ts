import { COLLECTION_NAME } from "./hook.ts/useSerices";
import {
  collection,
  doc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  DocumentData,
  QuerySnapshot,
} from "firebase/firestore";
import { Service, ServiceData } from "./type";
import { db } from "@/lib/firebase";
const getServices = async (): Promise<Service[]> => {
  const querySnapshot: QuerySnapshot<DocumentData> = await getDocs(
    collection(db, COLLECTION_NAME)
  );
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
