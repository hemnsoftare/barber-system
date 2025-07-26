// hooks/useAddMessage.ts
import { useMutation, useQuery } from "@tanstack/react-query";
import { addMessage } from "../action";
import {
  fetchReviews,
  submitReview,
  updateReviewStatus,
} from "../actionAppoitment";
import { Review } from "../type";

export function useAddMessage() {
  return useMutation({
    mutationFn: addMessage,
  });
}

interface UseReviewsOpts {
  userId?: string;
  barberId?: string;
  isAll?: boolean;
  status?: "pending" | "accept" | "reject";
  limit?: number;
}

export function useFilterReviews(opts: UseReviewsOpts) {
  const { userId, barberId, isAll, status, limit } = opts;

  return useQuery<Review[], Error>({
    queryKey: ["reviews", { userId, barberId, isAll }],
    queryFn: () => fetchReviews({ userId, barberId, isAll, limit, status }),
    enabled: Boolean(userId || barberId || isAll || status || limit), // fetch only when at least one filter present
  });
}
export const useSubmitReview = () => {
  return useMutation({
    mutationFn: submitReview,
  });
};

export function useUpdateReviewStatus() {
  return useMutation({
    mutationFn: ({
      reviewId,
      status,
    }: {
      reviewId: string;
      status: "accept" | "reject";
    }) => updateReviewStatus(reviewId, status),
  });
}
