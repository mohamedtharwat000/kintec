import { NextResponse } from "next/server";
import {
  getAllContractors,
  createContractors,
} from "@/services/contractors/contractorService";

export async function GET() {
  try {
    const contractors = await getAllContractors();
    return NextResponse.json(contractors, { status: 200 });
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
    const newContractor = await createContractors(body);
    return NextResponse.json(newContractor, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
