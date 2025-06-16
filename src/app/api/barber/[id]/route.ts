// app/api/barber/[id]/route.ts

import { PrismaClient } from "@prisma/client";
import { NextRequest } from "next/server";

const prisma = new PrismaClient();

// GET barber by ID
export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
): Promise<Response> {
  try {
    const { id } = await context.params;

    const barber = await prisma.barber.findUnique({
      where: { id },
      include: {
        availabilities: true,
        user: true,
        reviews: true,
      },
    });

    if (!barber) {
      return Response.json({ error: "Barber not found" }, { status: 404 });
    }

    return Response.json(barber);
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}

// PUT update barber by ID
export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
): Promise<Response> {
  try {
    const { id } = await context.params;
    const body = await req.json();

    const updatedBarber = await prisma.barber.update({
      where: { id },
      data: body,
    });

    return Response.json(updatedBarber);
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}

// DELETE barber by ID
export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
): Promise<Response> {
  try {
    const { id } = await context.params;

    await prisma.barber.delete({
      where: { id },
    });

    return Response.json({ success: true });
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
