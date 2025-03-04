import { NextResponse } from "next/server";
import {
  getRateById,
  updateRate,
  deleteRate,
} from "@/services/rates/rateService";

export async function GET(
  request: Request,
  context: { params: { rate_id: string } }
) {
  try {
    const params = await context.params;

    const rate = await getRateById(params.rate_id);
    if (!rate) {
      return NextResponse.json({ error: "Rate not found" }, { status: 404 });
    }
    return NextResponse.json(rate, { status: 200 });
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
  context: { params: { rate_id: string } }
) {
  try {
    const params = await context.params;
    const body = await request.json();
    const updated = await updateRate(params.rate_id, body);
    return NextResponse.json(updated, { status: 200 });
  } catch (error: any) {
    console.error(error.code);

    //    if (error instanceof Error && "code" in error && error.code === "P2014") {
    //        return NextResponse.json({ error: "Invalid Request" }, { status: 400 });
    //      }
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  context: { params: { rate_id: string } }
) {
  try {
    const params = await context.params;
    await deleteRate(params.rate_id);
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
