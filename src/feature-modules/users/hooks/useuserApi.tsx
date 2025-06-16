import axios from "axios";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { User } from "../type";
import {
  collection,
  doc,
  getDocs,
  query,
  setDoc,
  where,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

const API_URL = "/api/user";

// GET ALL USERS
export function useUsers() {
  return useQuery<User[]>({
    queryKey: ["users"],
    queryFn: async () => {
      const querySnapshot = await getDocs(collection(db, "users"));
      const res = querySnapshot.docs.map((doc) => doc.data() as User);
      console.log(res);
      return res;
    },
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

export function useCreateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (user: Omit<User, "id" | "createdAt">) => {
      // Step 1: Check if user exists (e.g., by email)
      const q = query(
        collection(db, "users"),
        where("email", "==", user.email)
      );
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        // User already exists
        throw new Error("User already exists with this email.");
      }

      // Step 2: Create new user
      const newUserRef = doc(collection(db, "users"));
      const newUser = {
        ...user,
        id: newUserRef.id,
        createdAt: new Date().toISOString(),
      };

      await setDoc(newUserRef, newUser);
      return newUserRef.id;
    },

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      alert("User created successfully!");
    },

    onError: (error) => {
      alert("Failed to create user: " + error.message);
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
