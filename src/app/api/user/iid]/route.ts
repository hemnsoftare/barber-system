// app/api/user/[id]/route.ts
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const user = await prisma.user.findUnique({
      where: { id },
    });

    if (!user)
      return Response.json({ error: "User not found" }, { status: 404 });
    return Response.json(user);
  } catch (error) {
    return Response.json(
      { error: error + "Failed to fetch user" },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const data = await req.json();
    const updated = await prisma.user.update({
      where: { id },
      data,
    });
    return Response.json(updated);
  } catch (error) {
    return Response.json(
      { error: error + "Failed to update user" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    await prisma.user.delete({
      where: { id },
    });
    return Response.json({ success: true });
  } catch (error) {
    return Response.json(
      { error: error + "Failed to delete user" },
      { status: 500 }
    );
  }
}
