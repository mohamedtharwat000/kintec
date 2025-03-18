import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import {
  getAllBankDetails,
  createBankDetail,
} from "@/services/bank_details/bankDetailService";
import { APIBankDetailData } from "@/types/BankDetail";

export async function GET() {
  try {
    const bankDetails = await getAllBankDetails();
    return NextResponse.json(bankDetails, { status: 200 });
  } catch (err) {
    const isPrismaError = err instanceof Prisma.PrismaClientKnownRequestError;
    const error = err instanceof Error ? err : new Error("Unknown error");
    return NextResponse.json(
      { error: error.message },
      { status: isPrismaError ? 400 : 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const requestData: APIBankDetailData | APIBankDetailData[] =
      await request.json();
    const bankDetails = await createBankDetail(requestData);
    return NextResponse.json(bankDetails, { status: 201 });
  } catch (err) {
    const isPrismaError = err instanceof Prisma.PrismaClientKnownRequestError;
    const error = err instanceof Error ? err : new Error("Unknown error");
    return NextResponse.json(
      { error: error.message },
      { status: isPrismaError ? 400 : 500 }
    );
  }
}
