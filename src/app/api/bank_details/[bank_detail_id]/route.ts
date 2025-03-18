import { NextResponse } from "next/server";
import {
  getBankDetailById,
  updateBankDetail,
  deleteBankDetail,
} from "@/services/bank_details/bankDetailService";
import { Prisma } from "@prisma/client";

export async function GET(
  request: Request,
  context: { params: Promise<{ bank_detail_id: string }> }
) {
  try {
    const { bank_detail_id } = await context.params;
    const bankDetail = await getBankDetailById(bank_detail_id);
    if (!bankDetail) {
      return NextResponse.json(
        { error: "Bank detail not found" },
        { status: 404 }
      );
    }
    return NextResponse.json(bankDetail, { status: 200 });
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
  context: { params: Promise<{ bank_detail_id: string }> }
) {
  try {
    const { bank_detail_id } = await context.params;
    const body = await request.json();
    const updated = await updateBankDetail(bank_detail_id, body);
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
  context: { params: Promise<{ bank_detail_id: string }> }
) {
  try {
    const { bank_detail_id } = await context.params;
    await deleteBankDetail(bank_detail_id);
    return NextResponse.json(
      { message: "Bank Detail deleted successfully" },
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
