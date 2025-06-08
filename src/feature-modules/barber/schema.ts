// File: schemas/createBarber.schema.ts
import { z } from "zod";

export const createBarberSchema = z.object({
  barberName: z.string().min(2, "Name is required"),
  barberDescription: z.string().min(5, "Description is required"),
  availability: z.array(
    z.object({
      day: z.string(),
      enabled: z.boolean(),
      from: z.string().optional(),
      to: z.string().optional(),
    })
  ),
  imageFile: z.instanceof(File).optional(),
});

export type CreateBarberInput = z.infer<typeof createBarberSchema>;
