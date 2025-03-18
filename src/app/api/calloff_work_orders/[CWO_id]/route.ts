import { NextResponse } from "next/server";
import {
  getCwoById,
  updateCwo,
  deleteCwo,
} from "@/services/calloff_work_orders/CwoService";
import { Prisma } from "@prisma/client";

export async function GET(
  request: Request,
  context: { params: Promise<{ CWO_id: string }> }
) {
  try {
    const { CWO_id } = await context.params;

    const calloff_work_order = await getCwoById(CWO_id);
    if (!calloff_work_order) {
      return NextResponse.json({ error: "CWO not found" }, { status: 404 });
    }
    return NextResponse.json(calloff_work_order, { status: 200 });
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
  context: { params: Promise<{ CWO_id: string }> }
) {
  try {
    const { CWO_id } = await context.params;
    const body = await request.json();
    const updated = await updateCwo(CWO_id, body);
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
  context: { params: Promise<{ CWO_id: string }> }
) {
  try {
    const { CWO_id } = await context.params;
    await deleteCwo(CWO_id);
    return NextResponse.json(
      { message: "CWO deleted successfully" },
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
