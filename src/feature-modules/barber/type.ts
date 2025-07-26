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
  id?: string;
  userId: string;
  fullName: string;
  email: string;
  phone: string;
  profileImage: string;
  experience: number;
  description: string;
  rating: number;
  reviewCount: number;
  totalBookings: number;
  isVerified: boolean;
  isActive: boolean;
  bio: string | null;
  createdAt: string;
  updatedAt: string;
  availability?: Availability[];
  dayOff?: DayOffEntry[];
  serviceIds?: string[];
}
export interface Availability {
  dayOfWeek: string;
  isEnabled: boolean;
  startTime: string;
  endTime: string;
  createdAt?: string;
  updatedAt?: string;
}
export type DayOffEntry = {
  date: Date | Timestamp; // You can convert to Timestamp when sending to Firebase
  wholeDay: boolean; // true if the whole day is off, false if specific hours
  from: string | null; //'3:00'
  to: string | null; // '17:40'
};

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
