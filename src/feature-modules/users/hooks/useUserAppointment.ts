import { useMutation } from "@tanstack/react-query";
import { updateAppointment } from "../action/actionAppoitment";
import { Service } from "@/feature-modules/barber/type/type";

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
