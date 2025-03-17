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
    const requestData: APIVisaDetailData | APIVisaDetailData[] =
      await request.json();
    const visaDetails = await createVisaDetail(requestData);

    return NextResponse.json(visaDetails, { status: 201 });
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
