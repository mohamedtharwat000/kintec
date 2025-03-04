import { NextResponse } from "next/server";
import {
  getAllBankDetails,
  createBankDetail,
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
    const newBankDetail = await createBankDetail(body);
    return NextResponse.json(newBankDetail, { status: 201 });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
