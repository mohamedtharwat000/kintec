import { NextResponse } from "next/server";
import {
  getContractorById,
  updateContractor,
  deleteContractor,
} from "@/services/contractors/contractorService";
import { Prisma } from "@prisma/client";

export async function GET(
  request: Request,
  context: { params: Promise<{ contractor_id: string }> }
) {
  try {
    const { contractor_id } = await context.params;

    const contractor = await getContractorById(contractor_id);
    if (!contractor) {
      return NextResponse.json(
        { error: "Contractor not found" },
        { status: 404 }
      );
    }
    return NextResponse.json(contractor, { status: 200 });
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
  context: { params: Promise<{ contractor_id: string }> }
) {
  try {
    const { contractor_id } = await context.params;
    const body = await request.json();
    const updated = await updateContractor(contractor_id, body);
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
  context: { params: Promise<{ contractor_id: string }> }
) {
  try {
    const { contractor_id } = await context.params;
    await deleteContractor(contractor_id);
    return NextResponse.json(
      { message: "Contractor deleted successfully" },
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
