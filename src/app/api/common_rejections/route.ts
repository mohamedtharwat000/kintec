import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import {
  getAllCommonRejections,
  createCommonRejection,
} from "@/services/common_rejections/commonRejectionService";
import { APICommonRejectionData } from "@/types/CommonRejection";

export async function GET() {
  try {
    const commonRejections = await getAllCommonRejections();
    return NextResponse.json(commonRejections, { status: 200 });
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
    const requestData: APICommonRejectionData | APICommonRejectionData[] =
      await request.json();
    const commonRejections = await createCommonRejection(requestData);

    return NextResponse.json(commonRejections, { status: 201 });
  } catch (err) {
    const isPrismaError = err instanceof Prisma.PrismaClientKnownRequestError;
    const error = err instanceof Error ? err : new Error("Unknown error");
    return NextResponse.json(
      { error: error.message },
      { status: isPrismaError ? 400 : 500 }
    );
  }
}
