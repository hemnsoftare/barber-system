// app/api/barber/availability/route.ts
import { PrismaClient, DayOfWeek } from "@prisma/client";
import { NextRequest } from "next/server";

const prisma = new PrismaClient();

// Helper function to convert time string to DateTime
function timeStringToDateTime(timeString: string): Date {
  const [hours, minutes] = timeString.split(":").map(Number);
  const date = new Date();
  date.setHours(hours, minutes, 0, 0);
  return date;
}

// Map string days to enum values
const dayMap: Record<string, DayOfWeek> = {
  Sunday: DayOfWeek.SUNDAY,
  Monday: DayOfWeek.MONDAY,
  Tuesday: DayOfWeek.TUESDAY,
  Wednesday: DayOfWeek.WEDNESDAY,
  Thursday: DayOfWeek.THURSDAY,
  Friday: DayOfWeek.FRIDAY,
  Saturday: DayOfWeek.SATURDAY,
};

interface AvailabilityRequest {
  barberId: string;
  availabilities: Array<{
    day: string;
    enabled: boolean;
    from?: string;
    to?: string;
  }>;
}

interface UpdateAvailabilityRequest {
  id: number;
  isEnabled?: boolean;
  startTime?: string;
  endTime?: string;
}

interface UpdateData {
  isEnabled?: boolean;
  startTime?: Date;
  endTime?: Date;
}

// GET - Get barber availability
export async function GET(req: NextRequest): Promise<Response> {
  try {
    const { searchParams } = new URL(req.url);
    const barberId = searchParams.get("barberId");

    if (!barberId) {
      return Response.json({ error: "Barber ID is required" }, { status: 400 });
    }

    const availabilities = await prisma.barberAvailability.findMany({
      where: { barberId },
      orderBy: { dayOfWeek: "asc" },
    });

    return Response.json(availabilities);
  } catch (error) {
    console.error("GET /api/barber/availability error:", error);
    return Response.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}

// POST - Create or update barber availability
export async function POST(req: Request): Promise<Response> {
  try {
    const body: AvailabilityRequest = await req.json();

    if (!body.barberId || !body.availabilities) {
      return Response.json(
        { error: "barberId and availabilities are required" },
        { status: 400 }
      );
    }

    // Verify barber exists
    const barber = await prisma.barber.findUnique({
      where: { id: body.barberId },
    });

    if (!barber) {
      return Response.json({ error: "Barber not found" }, { status: 404 });
    }

    // Delete existing availabilities and create new ones
    const result = await prisma.$transaction(async (tx) => {
      // Delete existing availabilities
      await tx.barberAvailability.deleteMany({
        where: { barberId: body.barberId },
      });

      // Create new availability records
      const availabilityData = body.availabilities
        .filter((avail) => avail.enabled && avail.from && avail.to)
        .map((avail) => ({
          barberId: body.barberId,
          dayOfWeek: dayMap[avail.day],
          isEnabled: avail.enabled,
          startTime: timeStringToDateTime(avail.from!),
          endTime: timeStringToDateTime(avail.to!),
        }));

      if (availabilityData.length > 0) {
        await tx.barberAvailability.createMany({
          data: availabilityData,
        });
      }

      // Return updated availabilities
      return await tx.barberAvailability.findMany({
        where: { barberId: body.barberId },
        orderBy: { dayOfWeek: "asc" },
      });
    });

    return Response.json(result, { status: 201 });
  } catch (error) {
    console.error("POST /api/barber/availability error:", error);
    return Response.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}

// PUT - Update specific availability
export async function PUT(req: Request): Promise<Response> {
  try {
    const body: UpdateAvailabilityRequest = await req.json();

    if (!body.id) {
      return Response.json(
        { error: "Availability ID is required" },
        { status: 400 }
      );
    }

    const updateData: UpdateData = {};
    if (body.isEnabled !== undefined) updateData.isEnabled = body.isEnabled;
    if (body.startTime)
      updateData.startTime = timeStringToDateTime(body.startTime);
    if (body.endTime) updateData.endTime = timeStringToDateTime(body.endTime);

    const updatedAvailability = await prisma.barberAvailability.update({
      where: { id: body.id },
      data: updateData,
    });

    return Response.json(updatedAvailability);
  } catch (error) {
    console.error("PUT /api/barber/availability error:", error);
    return Response.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}

// DELETE - Delete availability
export async function DELETE(req: NextRequest): Promise<Response> {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return Response.json(
        { error: "Availability ID is required" },
        { status: 400 }
      );
    }

    await prisma.barberAvailability.delete({
      where: { id: parseInt(id) },
    });

    return Response.json({
      success: true,
      message: "Availability deleted successfully",
    });
  } catch (error) {
    console.error("DELETE /api/barber/availability error:", error);
    return Response.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
