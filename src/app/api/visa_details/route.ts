import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import {
  getAllVisaDetails,
  createVisaDetail,
} from "@/services/visa_details/visaDetailService";
import { APIVisaDetailData } from "@/types/VisaDetail";

export async function GET() {
  try {
    const visaDetails = await getAllVisaDetails();
    return NextResponse.json(visaDetails, { status: 200 });
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
    const requestData: APIVisaDetailData | APIVisaDetailData[] =
      await request.json();
    const visaDetails = await createVisaDetail(requestData);

    return NextResponse.json(visaDetails, { status: 201 });
  } catch (err) {
    const isPrismaError = err instanceof Prisma.PrismaClientKnownRequestError;
    const error = err instanceof Error ? err : new Error("Unknown error");
    return NextResponse.json(
      { error: error.message },
      { status: isPrismaError ? 400 : 500 }
    );
  }
}
