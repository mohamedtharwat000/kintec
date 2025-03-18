import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { getAllRates, createRate } from "@/services/rates/rateService";
import { APIRateData } from "@/types/Rate";

export async function GET() {
  try {
    const rates = await getAllRates();
    return NextResponse.json(rates, { status: 200 });
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
    const requestData: APIRateData | APIRateData[] = await request.json();
    const rates = await createRate(requestData);

    return NextResponse.json(rates, { status: 201 });
  } catch (err) {
    const isPrismaError = err instanceof Prisma.PrismaClientKnownRequestError;
    const error = err instanceof Error ? err : new Error("Unknown error");
    return NextResponse.json(
      { error: error.message },
      { status: isPrismaError ? 400 : 500 }
    );
  }
}
