import { useMutation, useQuery } from "@tanstack/react-query";
import { fetchNotifications, markNotificationsRead } from "../action/action";
import { Notification } from "@/feature-modules/booking/type/type";

// Generic hook (accepts all filters)
type Filter =
  | { scope: "all" }
  | { scope: "user"; userId: string }
  | { scope: "barber"; barberId: string };

export const useGetFilterNotifications = (filter: Filter) =>
  useQuery<Notification[]>({
    queryKey: ["notifications", filter],
    queryFn: () => fetchNotifications(filter),
  });
type MarkFilter =
  | { scope: "all" }
  | { scope: "notification"; id: string } // single doc
  | { scope: "user"; userId: string } // all docs for user
  | { scope: "barber"; barberId: string }; // all docs for barber

export const useMarkNotificationsRead = () => {
  return useMutation({
    mutationFn: (filter: MarkFilter) => markNotificationsRead(filter),
    onSuccess: () => {
      // 🔄  invalidate any notification queries you’ve set up
    },
  });
};
