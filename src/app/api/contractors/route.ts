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
    const contractorsData = Array.isArray(body) ? body : [body];

    const newContractors = await createContractors(contractorsData);

    return NextResponse.json(newContractors, { status: 201 });
  } catch (error: any) {
    console.error(error);

    if (error?.code === "P2002") {
      return NextResponse.json(
        { error: "Duplicate contractor ID" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
