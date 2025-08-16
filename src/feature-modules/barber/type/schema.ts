import { z } from "zod";

// Enum for days of the week (matching your Prisma schema)
export enum DayOfWeek {
  SUNDAY = "SUNDAY",
  MONDAY = "MONDAY",
  TUESDAY = "TUESDAY",
  WEDNESDAY = "WEDNESDAY",
  THURSDAY = "THURSDAY",
  FRIDAY = "FRIDAY",
  SATURDAY = "SATURDAY",
}

// Enhanced schema for availability with additional fields for Firestore
export const availabilitySchema = z.object({
  dayOfWeek: z.nativeEnum(DayOfWeek),
  dayName: z.string().optional(), // Human-readable day name
  isEnabled: z.boolean(),
  startTime: z.date().nullable().optional(), // Date object or null
  endTime: z.date().nullable().optional(), // Date object or null
  from: z.string().optional(), // Keep original string format for form handling
  to: z.string().optional(), // Keep original string format for form handling
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

// Input schema for form data (what comes from the form)
export const availabilityInputSchema = z.object({
  day: z.nativeEnum(DayOfWeek),
  enabled: z.boolean(),
  from: z.string().optional(),
  to: z.string().optional(),
});

// Schema for creating a barber
export const createBarberSchema = z.object({
  userId: z.string().min(1, "User ID is required"),
  bio: z.string().optional(),
  description: z.string().min(10, "Description must be at least 10 characters"),
  experience: z.number().min(0, "Experience cannot be negative").optional(),
  profileImage: z.string().optional(), // Will be populated after image upload
  availabilities: z
    .array(availabilityInputSchema)
    .min(1, "At least one availability is required"),
});

// Schema for updating a barber
export const updateBarberSchema = z.object({
  id: z.string().min(1, "Barber ID is required"),
  bio: z.string().optional(),
  description: z
    .string()
    .min(10, "Description must be at least 10 characters")
    .optional(),
  experience: z.number().min(0, "Experience cannot be negative").optional(),
  profileImage: z.string().optional(),
  availabilities: z.array(availabilityInputSchema).optional(),
});

// Schema for the complete barber document (what gets stored in Firestore)
export const barberDocumentSchema = z.object({
  userId: z.string(),
  fullName: z.string().nullable(),
  email: z.string().nullable(),
  phone: z.string().nullable(),
  bio: z.string().nullable(),
  description: z.string(),
  experience: z.number().nullable(),
  profileImage: z.string().nullable(),
  rating: z.number(),
  totalBookings: z.number(),
  reviewCount: z.number(),
  isActive: z.boolean(),
  isVerified: z.boolean(),
  availability: z.array(availabilitySchema), // Full availability objects with dates
  createdAt: z.date(),
  updatedAt: z.date(),
});

// Schema for querying availability (more flexible for reads)
export const availabilityQuerySchema = z.object({
  dayOfWeek: z.nativeEnum(DayOfWeek).optional(),
  isEnabled: z.boolean().optional(),
  barberId: z.string().optional(),
});

// Types derived from schemas
export type CreateBarberInput = z.infer<typeof createBarberSchema>;
export type UpdateBarberInput = z.infer<typeof updateBarberSchema>;
export type AvailabilityInput = z.infer<typeof availabilityInputSchema>;
export type Availability = z.infer<typeof availabilitySchema>;
export type BarberDocument = z.infer<typeof barberDocumentSchema>;
export type AvailabilityQuery = z.infer<typeof availabilityQuerySchema>;

// Helper type for form data processing
export type AvailabilityFormData = {
  [key: string]: {
    enabled: boolean;
    from?: string;
    to?: string;
  };
};

// Utility function to convert form availability to Firestore availability
export const convertAvailabilityForFirestore = (
  inputAvailabilities: AvailabilityInput[]
): Availability[] => {
  return inputAvailabilities.map((avail) => ({
    dayOfWeek: avail.day,
    dayName: avail.day.charAt(0) + avail.day.slice(1).toLowerCase(), // Convert "MONDAY" to "Monday"
    isEnabled: avail.enabled,
    startTime:
      avail.enabled && avail.from ? timeStringToDateTime(avail.from) : null,
    endTime: avail.enabled && avail.to ? timeStringToDateTime(avail.to) : null,
    from: avail.from,
    to: avail.to,
    createdAt: new Date(),
    updatedAt: new Date(),
  }));
};

// Helper function to convert time string to Date (moved here for reusability)
export const timeStringToDateTime = (timeString: string): Date => {
  const [hours, minutes] = timeString.split(":").map(Number);
  const date = new Date();
  date.setHours(hours, minutes, 0, 0);
  return date;
};

// Helper function to get enabled availability for a specific day
export const getAvailabilityForDay = (
  availabilities: Availability[],
  day: DayOfWeek
): Availability | null => {
  return (
    availabilities.find(
      (avail) => avail.dayOfWeek === day && avail.isEnabled
    ) || null
  );
};

// Helper function to check if barber is available on a specific day
export const isAvailableOnDay = (
  availabilities: Availability[],
  day: DayOfWeek
): boolean => {
  const dayAvailability = getAvailabilityForDay(availabilities, day);
  return dayAvailability !== null;
};

// Helper function to get all enabled days
export const getEnabledDays = (availabilities: Availability[]): DayOfWeek[] => {
  return availabilities
    .filter((avail) => avail.isEnabled)
    .map((avail) => avail.dayOfWeek);
};
