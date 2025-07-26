import { Barber } from "@/feature-modules/barber/type"; // or wherever your Barber type is
import { create } from "zustand";
import { Service } from "@/feature-modules/barber/type";
import { persist } from "zustand/middleware";

interface SelectedServiceState {
  selected: Service | null;
  toggleSelected: (service: Service) => void;
  clearSelected: () => void;
}

export const useSelectedService = create<SelectedServiceState>()(
  persist(
    (set) => ({
      selected: null,

      toggleSelected: (service: Service) => {
        set({ selected: service });
      },

      clearSelected: () => set({ selected: null }),
    }),
    {
      name: "selected----service", // 💾 key in localStorage
    }
  )
);

interface SelectedBarberState {
  selected: Barber | null;
  toggleSelected: (barber: Barber) => void;
  clearSelected: () => void;
}
// Use persist middleware consistently for both
export const useSelectedBarber = create<SelectedBarberState>()(
  persist(
    (set) => ({
      selected: null,
      toggleSelected: (barber: Barber) => {
        set({ selected: barber });
      },
      clearSelected: () => set({ selected: null }),
    }),
    {
      name: "selected-----barber",
    }
  )
);
