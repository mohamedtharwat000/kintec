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
    const requestData: APIRPORuleData | APIRPORuleData[] = await request.json();
    const rpoRules = await createRpoRule(requestData);

    return NextResponse.json(rpoRules, { status: 201 });
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
