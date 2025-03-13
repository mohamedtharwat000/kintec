import { NextResponse } from "next/server";
import {
  getAllContracts,
  createContract,
  createContracts,
} from "@/services/contracts/contractService";

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
    const body = await request.json();
    const contractsData = Array.isArray(body) ? body : [body];

    const newContracts = await createContracts(contractsData);

    return NextResponse.json(newContracts, { status: 201 });
  } catch (error: any) {
    console.error(error.code);
    //Contract does not point at a contractor, client_company or a project
    if (error instanceof Error && "code" in error && error.code === "P2025") {
      return NextResponse.json({ error: "Invalid Request" }, { status: 400 });
    }
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
