import { DayOfWeek } from "@prisma/client";
import { User } from "../users/type";
import { Timestamp } from "firebase/firestore";

export interface BarberAvailability {
  id: number;
  barberId: string;
  dayOfWeek: DayOfWeek;
  isEnabled: boolean;
  startTime: string; // ISO string
  endTime: string; // ISO string
}
export interface Reviews {
  id: string;
  barber: BarberWithUserAndAvailability;
  barberId: string;
  user: User;
  userId: string;
  rating: number;
  comment: string;
  createdAt: Date;
  fullName: string;
  profileImage: string;
}
export interface BarberWithUserAndAvailability {
  id: string;
  userId: string;
  bio: string | null;
  profileImage: string | null;
  experience: number | null;
  rating: number;
  description: string;
  createdAt: string; // ISO string
  appointments: [];
  fullName: string;

  user: {
    id: string;
    fullName: string;
    email: string;
    image: string;
    phone: string | null;
    role: string | null;
    createdAt: string;
  };

  availabilities: BarberAvailability[];
}
export interface Barber {
  bio: string | null;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  description: string;
  email: string;
  experience: number;
  fullName: string;
  isActive: boolean;
  isVerified: boolean;
  phone: string;
  profileImage: string;
  rating: number;
  reviewCount: number;
  totalBookings: number;
  userId: string;

  availability?: {
    dayOfWeek: string; // e.g., "MONDAY"
    startTime: Timestamp;
    endTime: Timestamp;
    isEnabled: boolean;
    createdAt?: Timestamp;
    updatedAt?: Timestamp;
  }[];

  dayOff?: {
    date: Timestamp;
    wholeDay: boolean;
    from?: string | null;
    to?: string | null;
  }[];
  id?: string;
}
export interface ServiceData {
  name: string;
  description: string;
  duration: number;
  price: number;
  imageUrl: string;
}

export interface Service extends ServiceData {
  id: string;
}

export interface BarberWithServices extends Barber {
  id: string; // ✅ ADD THIS
  services: Service[];
}

export interface DayOffEntry {
  date: Timestamp; // actual date
  wholeDay: boolean;
  from?: string | null; // "09:00"
  to?: string | null; // "17:00"
}
