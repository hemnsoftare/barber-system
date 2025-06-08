"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { createBarberSchema } from "./schema";
import { DayOfWeek } from "@prisma/client";

// Map string days to Prisma enum
const dayMapping: Record<string, DayOfWeek> = {
  Sunday: "Sunday",
  Monday: "Monday",
  Tuesday: "Tuesday",
  Wednesday: "Wednesday",
  Thursday: "Thursday",
  Friday: "Friday",
  Saturday: "Saturday",
};

export async function createBarberAction(
  prevState: unknown,
  formData: FormData
) {
  try {
    // Extract form data
    const barberName = formData.get("barberName") as string;
    const barberDescription = formData.get("barberDescription") as string;
    const imageFile = formData.get("barberImage") as File | null;

    // Parse availability data (assuming it's sent as JSON string)
    const availabilityData = formData.get("availability") as string;
    let availability = [];

    if (availabilityData) {
      try {
        availability = JSON.parse(availabilityData);
      } catch (e) {
        console.error("Failed to parse availability data:", e);
      }
    }

    // Validate with Zod schema
    const validatedData = createBarberSchema.parse({
      barberName,
      barberDescription,
      availability,
      imageFile,
    });

    // Create barber in database
    const barber = await prisma.barber.create({
      data: {
        name: validatedData.barberName,
        description: validatedData.barberDescription,
        profileImage: "", // Will be updated after image upload
        bio: validatedData.barberDescription,
      },
    });

    // Create availability records
    if (validatedData.availability && validatedData.availability.length > 0) {
      const availabilityRecords = validatedData.availability
        .filter((item) => item.enabled)
        .map((item) => ({
          barberId: barber.id,
          dayOfWeek: dayMapping[item.day],
          isEnabled: item.enabled,
          startTime: item.from ? new Date(`1970-01-01T${item.from}:00`) : null,
          endTime: item.to ? new Date(`1970-01-01T${item.to}:00`) : null,
        }));

      if (availabilityRecords.length > 0) {
        await prisma.barberAvailability.createMany({
          data: availabilityRecords,
        });
      }
    }

    revalidatePath("/dashboard/barbers");

    return {
      success: true,
      message: "Barber created successfully",
      barberId: barber.id,
    };
  } catch (error) {
    console.error("Error creating barber:", error);

    if (error instanceof Error) {
      return {
        success: false,
        message: error.message,
        errors: {},
      };
    }

    return {
      success: false,
      message: "Failed to create barber",
      errors: {},
    };
  }
}
