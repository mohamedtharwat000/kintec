import { NextResponse } from "next/server";
import {
  getContractorById,
  updateContractors,
  deleteContractor,
} from "@/services/contractors/contractorService";

export async function GET(
  request: Request,
  context: { params: { contractor_id: string } }
) {
  try {
    const params = await context.params;

    const contractor = await getContractorById(params.contractor_id);
    if (!contractor) {
      return NextResponse.json(
        { error: "Contractor not found" },
        { status: 404 }
      );
    }
    return NextResponse.json(contractor, { status: 200 });
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
  context: { params: { contractor_id: string } }
) {
  try {
    const params = await context.params;
    const body = await request.json();
    const updated = await updateContractors([
      { contractor_id: params.contractor_id, ...body },
    ]);
    return NextResponse.json(updated[0], { status: 200 });
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
  context: { params: { contractor_id: string } }
) {
  try {
    const params = await context.params;
    await deleteContractor(params.contractor_id);
    // 204 responses typically have no body.
    return new NextResponse(null, { status: 204 });
  } catch (error: any) {
    console.error(error.code);
    console.error(error.message);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
