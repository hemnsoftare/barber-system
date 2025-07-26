import { useMutation } from "@tanstack/react-query";
import { updateAppointment } from "../actionAppoitment";
import { Service } from "@/feature-modules/barber/type";

export const useUpdateAppointment = () => {
  return useMutation({
    mutationFn: ({
      id,
      updates,
    }: {
      id: string;
      updates: {
        service?: Service;
        date: Date;
        startTime: string;
      };
    }) => updateAppointment(id, updates),
  });
};
