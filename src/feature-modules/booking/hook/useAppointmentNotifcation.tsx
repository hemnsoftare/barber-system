// hooks/useSendNotification.ts
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  getNotifications,
  sendNotification,
} from "../action/actionNotifcation";
import { Notification } from "../type/type";

export function useSendNotification() {
  return useMutation({
    mutationFn: (data: Omit<Notification, "id" | "read" | "createdAt">) =>
      sendNotification(data),
  });
}

export function useNotifications({
  userId,
  barberId,
}: {
  userId?: string;
  barberId?: string;
}) {
  return useQuery({
    queryKey: ["notifications", userId || barberId],
    queryFn: () => getNotifications({ userId, barberId }),
    enabled: !!userId || !!barberId, // won't run unless one is present
  });
}
