import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import {
  getAllContractors,
  createContractor,
} from "@/services/contractors/contractorService";
import { APIContractorData } from "@/types/Contractor";

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
    const requestData: APIContractorData | APIContractorData[] =
      await request.json();
    const contractors = await createContractor(requestData);

    return NextResponse.json(contractors, { status: 201 });
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
