import axios from "axios";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { User } from "../type";

const API_URL = "/api/user";

// GET ALL USERS
export function useUsers() {
  return useQuery<User[]>({
    queryKey: ["users"],
    queryFn: async () => {
      const res = await axios.get<User[]>(API_URL);
      return res.data;
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
    mutationFn: (user: Omit<User, "id" | "createdAt">) =>
      axios.post<User>(API_URL, user).then((res) => res.data),
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
