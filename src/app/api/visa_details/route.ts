import { NextResponse } from "next/server";
import {
  getAllVisaDetails,
  createVisaDetails,
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
    const visaDetailsData = Array.isArray(body) ? body : [body];

    const newVisaDetails = await createVisaDetails(visaDetailsData);

    return NextResponse.json(newVisaDetails, { status: 201 });
  } catch (error: any) {
    if (error instanceof Error && "code" in error && error.code === "P2002") {
      return NextResponse.json({ error: "Invalid Request" }, { status: 400 });
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
