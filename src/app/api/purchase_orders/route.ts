import { NextResponse } from "next/server";
import {
  getAllPurchaseOrders,
  createPurchaseOrder,
} from "@/services/purchase_orders/purchaseOrderService";

export async function GET() {
  try {
    const purchaseOrders = await getAllPurchaseOrders();
    return NextResponse.json(purchaseOrders, { status: 200 });
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
    const newPurchaseOrder = await createPurchaseOrder(body);
    return NextResponse.json(newPurchaseOrder, { status: 201 });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
