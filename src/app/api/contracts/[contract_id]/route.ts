import { NextResponse } from "next/server";
import {
  getContractById,
  updateContract,
  deleteContract,
} from "@/services/contracts/contractService";

export async function GET(
  request: Request,
  context: { params: { contract_id: string } }
) {
  try {
    const params = await context.params;

    const contract = await getContractById(params.contract_id);
    if (!contract) {
      return NextResponse.json(
        { error: "Contract not found" },
        { status: 404 }
      );
    }
    return NextResponse.json(contract, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  context: { params: { contract_id: string } }
) {
  try {
    const params = await context.params;
    const body = await request.json();
    const updated = await updateContract(params.contract_id, body);
    return NextResponse.json(updated, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  context: { params: { contract_id: string } }
) {
  try {
    const params = await context.params;
    await deleteContract(params.contract_id);
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
