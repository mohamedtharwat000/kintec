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
    const requestData: APIPurchaseOrderData | APIPurchaseOrderData[] =
      await request.json();
    const purchaseOrders = await createPurchaseOrder(requestData);

    return NextResponse.json(purchaseOrders, { status: 201 });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    } else {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
  }
}
