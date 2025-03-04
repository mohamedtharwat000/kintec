import { NextResponse } from "next/server";
import {
  getAllPos,
  createPo,
} from "@/services/purchase_orders/purchaseOrderService";

export async function GET() {
  try {
    const purchase_orders = await getAllPos();
    return NextResponse.json(purchase_orders, { status: 200 });
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
    const newPo = await createPo(body);
    return NextResponse.json(newPo, { status: 201 });
  } catch (error: any) {
    console.error(error.code);
    //Purchase order does not point at a contract
    if (error instanceof Error && "code" in error && error.code === "P2014") {
      return NextResponse.json({ error: "Invalid Request" }, { status: 400 });
    }
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
