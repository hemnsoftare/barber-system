// route.ts for /api/barber
// Handles GET all barbers and POST create barber

import { PrismaClient, Barber } from "@prisma/client";

const prisma = new PrismaClient();

// GET all barbers
export async function GET(): Promise<Response> {
  try {
    const barbers = await prisma.barber.findMany({
      include: {
        availabilities: true,
        user: true,
        appointments: true,
      },
    });
    return Response.json(barbers);
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}

// POST create barber
export async function POST(req: Request): Promise<Response> {
  try {
    const body: Omit<Barber, "id" | "createdAt" | "rating"> = await req.json();

    // Validate required fields
    if (!body.userId || !body.description) {
      return Response.json(
        { error: "userId and description are required" },
        { status: 400 }
      );
    }

    // Check if user already has a barber profile
    const existingBarber = await prisma.barber.findUnique({
      where: { userId: body.userId },
    });

    if (existingBarber) {
      return Response.json(
        { error: "This user already has a barber profile" },
        { status: 409 }
      );
    }

    // Create the barber
    const newBarber = await prisma.barber.create({
      data: {
        ...body,
        rating: 0, // default rating
      },
      include: {
        availabilities: true,
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
            image: true,
          },
        },
      },
    });

    return Response.json(newBarber, { status: 201 });
  } catch (error) {
    console.error("POST /api/barber error:", error);
    return Response.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
