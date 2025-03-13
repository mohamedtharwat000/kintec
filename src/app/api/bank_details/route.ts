import { NextResponse } from "next/server";
import {
  getAllBankDetails,
  createBankDetails,
} from "@/services/bank_details/bankDetailService";

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
    const body = await request.json();
    const bankDetailsData = Array.isArray(body) ? body : [body];

    const newBankDetails = await createBankDetails(bankDetailsData);

    return NextResponse.json(newBankDetails, { status: 201 });
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
