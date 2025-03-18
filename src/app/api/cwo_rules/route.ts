import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import {
  getAllCwoRules,
  createCwoRule,
} from "@/services/cwo_rules/CwoRuleService";
import { APICWORuleData } from "@/types/CWORule";

export async function GET() {
  try {
    const cwoRules = await getAllCwoRules();
    return NextResponse.json(cwoRules, { status: 200 });
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
    const requestData: APICWORuleData | APICWORuleData[] = await request.json();
    const cwoRules = await createCwoRule(requestData);

    return NextResponse.json(cwoRules, { status: 201 });
  } catch (err) {
    const isPrismaError = err instanceof Prisma.PrismaClientKnownRequestError;
    const error = err instanceof Error ? err : new Error("Unknown error");
    return NextResponse.json(
      { error: error.message },
      { status: isPrismaError ? 400 : 500 }
    );
  }
}
