import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import {
  getAllContractors,
  createContractor,
} from "@/services/contractors/contractorService";
import { APIContractorData } from "@/types/ContractorType";

export async function GET() {
  try {
    const contractors = await getAllContractors();
    return NextResponse.json(contractors, { status: 200 });
  } catch (err) {
    const isPrismaError = err instanceof Prisma.PrismaClientKnownRequestError;
    const error = err instanceof Error ? err : new Error("Unknown error");
    return NextResponse.json(
      { error: error.message },
      { status: isPrismaError ? 400 : 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const requestData: APIContractorData | APIContractorData[] =
      await request.json();
    const contractors = await createContractor(requestData);

    return NextResponse.json(contractors, { status: 201 });
  } catch (err) {
    const isPrismaError = err instanceof Prisma.PrismaClientKnownRequestError;
    const error = err instanceof Error ? err : new Error("Unknown error");
    return NextResponse.json(
      { error: error.message },
      { status: isPrismaError ? 400 : 500 }
    );
  }
}
