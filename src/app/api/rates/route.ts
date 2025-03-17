import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { getAllRates, createRate } from "@/services/rates/rateService";
import { APIRateData } from "@/types/Rate";

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
    const requestData: APIRateData | APIRateData[] = await request.json();
    const rates = await createRate(requestData);

    return NextResponse.json(rates, { status: 201 });
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
