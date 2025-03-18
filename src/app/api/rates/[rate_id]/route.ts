import { NextResponse } from "next/server";
import {
  getRateById,
  updateRate,
  deleteRate,
} from "@/services/rates/rateService";
import { Prisma } from "@prisma/client";

export async function GET(
  request: Request,
  context: { params: Promise<{ rate_id: string }> }
) {
  try {
    const { rate_id } = await context.params;

    const rate = await getRateById(rate_id);
    if (!rate) {
      return NextResponse.json({ error: "Rate not found" }, { status: 404 });
    }
    return NextResponse.json(rate, { status: 200 });
  } catch (err) {
    const isPrismaError = err instanceof Prisma.PrismaClientKnownRequestError;
    const error = err instanceof Error ? err : new Error("Unknown error");
    return NextResponse.json(
      { error: error.message },
      { status: isPrismaError ? 400 : 500 }
    );
  }
}

export async function PUT(
  request: Request,
  context: { params: Promise<{ rate_id: string }> }
) {
  try {
    const { rate_id } = await context.params;
    const body = await request.json();
    const updated = await updateRate(rate_id, body);
    return NextResponse.json(updated, { status: 200 });
  } catch (err) {
    const isPrismaError = err instanceof Prisma.PrismaClientKnownRequestError;
    const error = err instanceof Error ? err : new Error("Unknown error");
    return NextResponse.json(
      { error: error.message },
      { status: isPrismaError ? 400 : 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  context: { params: Promise<{ rate_id: string }> }
) {
  try {
    const { rate_id } = await context.params;
    await deleteRate(rate_id);
    return NextResponse.json(
      { message: "Rate deleted successfully" },
      { status: 200 }
    );
  } catch (err) {
    const isPrismaError = err instanceof Prisma.PrismaClientKnownRequestError;
    const error = err instanceof Error ? err : new Error("Unknown error");
    return NextResponse.json(
      { error: error.message },
      { status: isPrismaError ? 400 : 500 }
    );
  }
}
