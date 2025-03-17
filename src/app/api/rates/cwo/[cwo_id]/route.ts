import { NextResponse } from "next/server";
import { getRatesByCWOId } from "@/services/rates/rateService";

export async function GET(
  request: Request,
  context: { params: { cwo_id: string } }
) {
  try {
    const params = context.params;
    const rates = await getRatesByCWOId(params.cwo_id);
    return NextResponse.json(rates, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
