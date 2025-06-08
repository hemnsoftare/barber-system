// types/user.ts
export interface User {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  role?: string;
  createdAt: string;
  barberId?: string;
  image?: string;
}
