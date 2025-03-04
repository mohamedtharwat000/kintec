import { NextResponse } from "next/server";
import {
  getAllVisaDetails,
  createVisaDetail,
} from "@/services/visa_details/visaDetailService";

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
    const body = await request.json();
    const newVisaDetail = await createVisaDetail(body);
    return NextResponse.json(newVisaDetail, { status: 201 });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
