import { NextResponse } from "next/server";
import {
  getPurchaseOrderById,
  updatePurchaseOrder,
  deletePurchaseOrder,
} from "@/services/purchase_orders/purchaseOrderService";

export async function GET(
  request: Request,
  context: { params: { po_id: string } }
) {
  try {
    const { po_id } = context.params;
    const purchaseOrder = await getPurchaseOrderById(po_id);

    if (!purchaseOrder) {
      return NextResponse.json(
        { error: "Purchase order not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(purchaseOrder, { status: 200 });
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
  context: { params: { po_id: string } }
) {
  try {
    const { po_id } = context.params;
    const body = await request.json();

    const updated = await updatePurchaseOrder(po_id, body);
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
  context: { params: { po_id: string } }
) {
  try {
    const { po_id } = context.params;
    await deletePurchaseOrder(po_id);
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
