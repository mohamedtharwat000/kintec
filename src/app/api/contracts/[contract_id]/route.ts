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
    console.log("here1");
    const body = await request.json();
    console.log("here2");
    const updated = await updateContract(params.contract_id, body);
    console.log("here3");
    return NextResponse.json(updated, { status: 200 });
  } catch (error: any) {
    console.log("inside catch");
    console.error(error.code);
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
    // 204 responses typically have no body.
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
