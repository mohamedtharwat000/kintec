import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import {
  getAllCwos,
  createCwo,
} from "@/services/calloff_work_orders/CwoService";
import { APICalloffWorkOrderData } from "@/types/CalloffWorkOrder";

export async function GET() {
  try {
    const calloff_work_orders = await getAllCwos();
    return NextResponse.json(calloff_work_orders, { status: 200 });
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
    const requestData: APICalloffWorkOrderData | APICalloffWorkOrderData[] =
      await request.json();
    const calloff_work_orders = await createCwo(requestData);

    return NextResponse.json(calloff_work_orders, { status: 201 });
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
