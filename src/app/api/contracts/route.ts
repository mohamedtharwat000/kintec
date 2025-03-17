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
    const requestData: APIContractData | APIContractData[] =
      await request.json();
    const contracts = await createContract(requestData);

    return NextResponse.json(contracts, { status: 201 });
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
