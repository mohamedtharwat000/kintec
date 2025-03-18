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
    const requestData: APICalloffWorkOrderData | APICalloffWorkOrderData[] =
      await request.json();
    const calloff_work_orders = await createCwo(requestData);

    return NextResponse.json(calloff_work_orders, { status: 201 });
  } catch (err) {
    const isPrismaError = err instanceof Prisma.PrismaClientKnownRequestError;
    const error = err instanceof Error ? err : new Error("Unknown error");
    return NextResponse.json(
      { error: error.message },
      { status: isPrismaError ? 400 : 500 }
    );
  }
}
