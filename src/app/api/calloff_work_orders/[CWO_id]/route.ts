import { NextResponse } from "next/server";
import {
  getCwoById,
  updateCwo,
  deleteCwo,
} from "@/services/calloff_work_orders/CwoService";

export async function GET(
  request: Request,
  context: { params: { CWO_id: string } }
) {
  try {
    const params = await context.params;

    const calloff_work_order = await getCwoById(params.CWO_id);
    if (!calloff_work_order) {
      return NextResponse.json({ error: "CWO not found" }, { status: 404 });
    }
    return NextResponse.json(calloff_work_order, { status: 200 });
  } catch (error) {
    //console.error(error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  context: { params: { CWO_id: string } }
) {
  try {
    const params = await context.params;
    const body = await request.json();
    const updated = await updateCwo(params.CWO_id, body);
    return NextResponse.json(updated, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  context: { params: { CWO_id: string } }
) {
  try {
    const params = await context.params;
    await deleteCwo(params.CWO_id);
    // 204 responses typically have no body.
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    //console.error(error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
