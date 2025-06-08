"use server";
// src/lib/actions/user.actions.ts
import prisma from "@/lib/prisma";

export async function getAllUsers() {
  return await prisma.user.findMany();
}
// src/ac
// tions/createUser.ts

export async function createUserInDB(user: {
  id: string;
  email: string;
  fullName: string;
}) {
  await prisma.user.create({ data: user });
}
