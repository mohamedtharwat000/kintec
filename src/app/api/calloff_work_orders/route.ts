import { NextResponse } from "next/server";
import {
  getAllCwos,
  createCwo,
} from "@/services/calloff_work_orders/CwoService";

export async function GET() {
  try {
    const calloff_work_orders = await getAllCwos();
    return NextResponse.json(calloff_work_orders, { status: 200 });
  } catch (error) {
    //console.error(error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const newCwo = await createCwo(body);
    return NextResponse.json(newCwo, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
