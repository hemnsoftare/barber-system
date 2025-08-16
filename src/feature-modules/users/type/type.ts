// types/user.ts
export interface User {
  id: string;
  fullName: string;
  email: string;
  role?: string;
  barberId?: string;
  image?: string;
}

export interface Review {
  userName: string;
  userEmail: string;
  rating: number;
  reviewMessage: string;
  userId: string;
  barberId: string;
  barberEmail: string;
  barberName: string;
  id?: string;
  status: "pending" | "accept" | "reject";
  createdAt: Date;
}
