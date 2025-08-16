import axios from "axios";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";

const API_URL = "/api/user";

// GET ALL USERS
import { useInfiniteQuery } from "@tanstack/react-query";
import {
  limit,
  startAfter,
  QueryDocumentSnapshot,
  DocumentData,
} from "firebase/firestore";
import { User } from "../type/type";
import { getNonCustomerUsers, upsertUser } from "../action/action";

const USERS_PER_PAGE = 20; // adjust as needed

export function useUsers() {
  return useInfiniteQuery<User[], Error>({
    queryKey: ["users"],
    queryFn: async ({ pageParam }) => {
      let q = query(collection(db, "users"), limit(USERS_PER_PAGE));

      // If we have a pageParam (cursor), start after that document
      if (pageParam) {
        q = query(
          collection(db, "users"),
          startAfter(pageParam),
          limit(USERS_PER_PAGE)
        );
      }

      const querySnapshot = await getDocs(q);
      const users = querySnapshot.docs.map(
        (doc) =>
          ({
            id: doc.id,
            ...doc.data(),
          } as User)
      );

      return users;
    },
    getNextPageParam: (lastPage, allPages) => {
      // If the last page has fewer items than the limit, we've reached the end
      console.log(allPages);
      if (lastPage.length < USERS_PER_PAGE) {
        return undefined;
      }

      // Return the last document as the cursor for the next page
      const lastDoc = lastPage[lastPage.length - 1];
      return lastDoc; // This will be passed as pageParam
    },
    initialPageParam: null as QueryDocumentSnapshot<DocumentData> | null,
  });
}

// GET ONE USER
export function useUser(id: string) {
  return useQuery<User>({
    queryKey: ["user", id],
    queryFn: async () => {
      const res = await axios.get<User>(`${API_URL}/${id}`);
      return res.data;
    },
    enabled: !!id, // Only run if ID is truthy
  });
}

// CREATE USER

/* ------------------------ Upsert (create / update) ----------------------- */

export function useCreateUser() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: upsertUser,
    onSuccess: (data) => {
      // prime / refresh any caches keyed by this user
      qc.setQueryData(["user", data.id], data);
    },
  });
}
// UPDATE USER
export function useUpdateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: Partial<Omit<User, "id" | "createdAt">>;
    }) => axios.put<User>(`${API_URL}/${id}`, data).then((res) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
}

// DELETE USER
export function useDeleteUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      axios
        .delete<{ success: boolean }>(`${API_URL}/${id}`)
        .then((res) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
}

// 🔥 Actual React hook
export function useNonCustomerUsers() {
  return useQuery({
    queryKey: ["nonCustomerUsers"],
    queryFn: getNonCustomerUsers,
  });
}

export function useCustomerUsers() {
  return useQuery<User[], Error>({
    queryKey: ["customerUsers"],
    queryFn: async () => {
      const q = query(collection(db, "users"), where("role", "==", "customer"));
      const querySnapshot = await getDocs(q);
      const users = querySnapshot.docs
        .map(
          (doc) =>
            ({
              id: doc.id,
              ...doc.data(),
            } as User)
        )
        .filter((user) => user.role === "customer");
      return users;
    },
  });
}
