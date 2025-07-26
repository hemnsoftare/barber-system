import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { BarberMessage, fetchMessages, markMessagesRead } from "./action";

export const useMessages = (filter: Parameters<typeof fetchMessages>[0]) =>
  useQuery<BarberMessage[]>({
    queryKey: ["messages", filter],
    queryFn: () => fetchMessages(filter),
    enabled: filter.scope === "all" || !!filter.userId, // only run when ready
  });

export const useMarkMessagesRead = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: markMessagesRead,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["messages"] }),
  });
};
