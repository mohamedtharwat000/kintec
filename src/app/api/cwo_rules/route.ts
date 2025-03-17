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
    const requestData: APICWORuleData | APICWORuleData[] = await request.json();
    const cwoRules = await createCwoRule(requestData);

    return NextResponse.json(cwoRules, { status: 201 });
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
