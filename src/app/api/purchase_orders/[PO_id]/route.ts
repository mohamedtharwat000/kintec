import { NextResponse } from "next/server";
import {
  getPoById,
  updatePo,
  deletePo,
} from "@/services/purchase_orders/purchaseOrderService";

export async function GET(
  request: Request,
  context: { params: { PO_id: string } }
) {
  try {
    const params = await context.params;

    const purchase_order = await getPoById(params.PO_id);
    if (!purchase_order) {
      return NextResponse.json(
        { error: "Purchase order not found" },
        { status: 404 }
      );
    }
    return NextResponse.json(purchase_order, { status: 200 });
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
  context: { params: { PO_id: string } }
) {
  try {
    const params = await context.params;
    const body = await request.json();
    const updated = await updatePo(params.PO_id, body);
    return NextResponse.json(updated, { status: 200 });
  } catch (error: any) {
    console.error(error.code);
    //A contract cannot be pointed at by more than one PO
    if (error instanceof Error && "code" in error && error.code === "P2014") {
      return NextResponse.json({ error: "Invalid Request" }, { status: 400 });
    }
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  context: { params: { PO_id: string } }
) {
  try {
    const params = await context.params;
    await deletePo(params.PO_id);
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
