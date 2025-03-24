import { NextResponse } from "next/server";
import {
  getPurchaseOrderById,
  updatePurchaseOrder,
  deletePurchaseOrder,
} from "@/services/purchase_orders/purchaseOrderService";
import { Prisma } from "@prisma/client";

export async function GET(
  request: Request,
  context: { params: Promise<{ po_id: string }> }
) {
  try {
    const { po_id } = await context.params;
    const purchaseOrder = await getPurchaseOrderById(po_id);

    if (!purchaseOrder) {
      return NextResponse.json(
        { error: "Purchase order not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(purchaseOrder, { status: 200 });
  } catch (err) {
    const isPrismaError = err instanceof Prisma.PrismaClientKnownRequestError;
    const error = err instanceof Error ? err : new Error("Unknown error");
    return NextResponse.json(
      { error: error.message },
      { status: isPrismaError ? 400 : 500 }
    );
  }
}

export async function PUT(
  request: Request,
  context: { params: Promise<{ po_id: string }> }
) {
  try {
    const { po_id } = await context.params;
    const body = await request.json();

    const updated = await updatePurchaseOrder(po_id, body);
    return NextResponse.json(updated, { status: 200 });
  } catch (err) {
    const isPrismaError = err instanceof Prisma.PrismaClientKnownRequestError;
    const error = err instanceof Error ? err : new Error("Unknown error");
    return NextResponse.json(
      { error: error.message },
      { status: isPrismaError ? 400 : 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  context: { params: Promise<{ po_id: string }> }
) {
  try {
    const { po_id } = await context.params;
    await deletePurchaseOrder(po_id);
    return NextResponse.json(
      { message: "Purchase Order deleted successfully" },
      { status: 200 }
    );
  } catch (err) {
    const isPrismaError = err instanceof Prisma.PrismaClientKnownRequestError;
    const error = err instanceof Error ? err : new Error("Unknown error");
    return NextResponse.json(
      { error: error.message },
      { status: isPrismaError ? 400 : 500 }
    );
  }
}
