import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import {
  getAllPurchaseOrders,
  createPurchaseOrder,
} from "@/services/purchase_orders/purchaseOrderService";
import { APIPurchaseOrderData } from "@/types/PurchaseOrder";

export async function GET() {
  try {
    const purchaseOrders = await getAllPurchaseOrders();
    return NextResponse.json(purchaseOrders, { status: 200 });
  } catch (err) {
    const isPrismaError = err instanceof Prisma.PrismaClientKnownRequestError;
    const error = err instanceof Error ? err : new Error("Unknown error");
    return NextResponse.json(
      { error: error.message },
      { status: isPrismaError ? 400 : 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const requestData: APIPurchaseOrderData | APIPurchaseOrderData[] =
      await request.json();
    const purchaseOrders = await createPurchaseOrder(requestData);

    return NextResponse.json(purchaseOrders, { status: 201 });
  } catch (err) {
    const isPrismaError = err instanceof Prisma.PrismaClientKnownRequestError;
    const error = err instanceof Error ? err : new Error("Unknown error");
    return NextResponse.json(
      { error: error.message },
      { status: isPrismaError ? 400 : 500 }
    );
  }
}
