import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { addFavorite, removeFavorite } from "../actionFavorite";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";

export const useUserFavorites = (userId: string) => {
  return useQuery({
    queryKey: ["favorites", userId],
    queryFn: async () => {
      const q = query(
        collection(db, "favorites"),
        where("userId", "==", userId)
      );
      const snap = await getDocs(q);
      return snap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as {
        id: string;
        imageUrl: string;
        imageId: string;
        userId: string;
      }[];
    },
    enabled: !!userId,
  });
};
export const useAddFavoriteMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: addFavorite,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["favorites", variables.userId],
      });
    },
  });
};

export const useRemoveFavoriteMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, imageId }: { userId: string; imageId: string }) =>
      removeFavorite(userId, imageId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["favorites", variables.userId],
      });
    },
  });
};
