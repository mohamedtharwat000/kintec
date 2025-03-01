import { NextResponse } from "next/server";
import {
  getAllContractors,
  createContractor,
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
    const newContractor = await createContractor(body);
    return NextResponse.json(newContractor, { status: 201 });
  } catch (error: any) {
    console.error(error);

    if (error instanceof Error && "code" in error && error.code === "P2002") {
      return NextResponse.json({ error: "Invalid Request" }, { status: 400 });
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
