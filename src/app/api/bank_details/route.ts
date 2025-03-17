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
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const requestData: APIBankDetailData | APIBankDetailData[] =
      await request.json();
    const bankDetails = await createBankDetail(requestData);

    return NextResponse.json(bankDetails, { status: 201 });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    } else {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
  }
}
