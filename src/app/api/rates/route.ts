import { NextResponse } from "next/server";
import {
  getAllRates,
  createRate,
  createBatchRates,
} from "@/services/rates/rateService";

export async function GET() {
  try {
    const rates = await getAllRates();
    return NextResponse.json(rates, { status: 200 });
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

    // Check if it's a batch operation
    if (Array.isArray(body)) {
      const newRates = await createBatchRates(body);
      return NextResponse.json(newRates, { status: 201 });
    } else {
      // Single rate creation
      const newRate = await createRate(body);
      return NextResponse.json(newRate, { status: 201 });
    }
  } catch (error: any) {
    console.error(error);

    if (
      error.message === "Either PO_id or CWO_id must be provided, but not both"
    ) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    if (error instanceof Error && "code" in error && error.code === "P2025") {
      return NextResponse.json(
        { error: "Invalid Reference ID" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
