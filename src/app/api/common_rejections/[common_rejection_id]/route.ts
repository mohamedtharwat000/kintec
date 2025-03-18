import { NextResponse } from "next/server";
import {
  getCommonRejectionById,
  updateCommonRejection,
  deleteCommonRejection,
} from "@/services/common_rejections/commonRejectionService";
import { Prisma } from "@prisma/client";

export async function GET(
  request: Request,
  context: { params: Promise<{ common_rejection_id: string }> }
) {
  try {
    const { common_rejection_id } = await context.params;
    const rejection = await getCommonRejectionById(common_rejection_id);
    if (!rejection) {
      return NextResponse.json(
        { error: "Common rejection not found" },
        { status: 404 }
      );
    }
    return NextResponse.json(rejection, { status: 200 });
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
  context: { params: Promise<{ common_rejection_id: string }> }
) {
  try {
    const { common_rejection_id } = await context.params;
    const body = await request.json();
    const updated = await updateCommonRejection(common_rejection_id, body);
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
  context: { params: Promise<{ common_rejection_id: string }> }
) {
  try {
    const { common_rejection_id } = await context.params;
    await deleteCommonRejection(common_rejection_id);
    return NextResponse.json(
      { message: "Common Rejection deleted successfully" },
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
