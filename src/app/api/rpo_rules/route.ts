import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import {
  getAllRpoRules,
  createRpoRule,
} from "@/services/rpo_rules/RpoRuleService";
import { APIRPORuleData } from "@/types/PORule";

export async function GET() {
  try {
    const rpoRules = await getAllRpoRules();
    return NextResponse.json(rpoRules, { status: 200 });
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
    const requestData: APIRPORuleData | APIRPORuleData[] = await request.json();
    const rpoRules = await createRpoRule(requestData);

    return NextResponse.json(rpoRules, { status: 201 });
  } catch (err) {
    const isPrismaError = err instanceof Prisma.PrismaClientKnownRequestError;
    const error = err instanceof Error ? err : new Error("Unknown error");
    return NextResponse.json(
      { error: error.message },
      { status: isPrismaError ? 400 : 500 }
    );
  }
}
