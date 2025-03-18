import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import {
  getAllContracts,
  createContract,
} from "@/services/contracts/contractService";
import { APIContractData } from "@/types/Contract";

export async function GET() {
  try {
    const contracts = await getAllContracts();
    return NextResponse.json(contracts, { status: 200 });
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
    const requestData: APIContractData | APIContractData[] =
      await request.json();
    const contracts = await createContract(requestData);

    return NextResponse.json(contracts, { status: 201 });
  } catch (err) {
    const isPrismaError = err instanceof Prisma.PrismaClientKnownRequestError;
    const error = err instanceof Error ? err : new Error("Unknown error");
    return NextResponse.json(
      { error: error.message },
      { status: isPrismaError ? 400 : 500 }
    );
  }
}
