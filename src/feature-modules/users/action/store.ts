import { create } from "zustand";
import { persist } from "zustand/middleware";
import { AppointmentProps } from "@/feature-modules/booking/action/action";
import { User } from "../type/type";

interface SelectedAppointmentState {
  selected: AppointmentProps | null;
  setSelected: (appointment: AppointmentProps) => void;
  clearSelected: () => void;
}

export const useSelectedAppointment = create<SelectedAppointmentState>()(
  persist(
    (set) => ({
      selected: null,
      setSelected: (appointment) => set({ selected: appointment }),
      clearSelected: () => set({ selected: null }),
    }),
    {
      name: "selected-appointment", // key in localStorage
    }
  )
);
// stores/useSelectedUser.ts

interface SelectedUserStore {
  selectedUser: User | null;
  selectUser: (user: User) => void;
  clearUser: () => void;
}

export const useSelectedUser = create<SelectedUserStore>()(
  persist(
    (set) => ({
      selectedUser: null,
      selectUser: (user) => set({ selectedUser: user }),
      clearUser: () => set({ selectedUser: null }),
    }),
    {
      name: "selected-user", // 🧠 key in localStorage
    }
  )
);
