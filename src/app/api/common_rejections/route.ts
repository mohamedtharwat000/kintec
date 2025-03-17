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
    const requestData: APICommonRejectionData | APICommonRejectionData[] =
      await request.json();
    const commonRejections = await createCommonRejection(requestData);

    return NextResponse.json(commonRejections, { status: 201 });
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
