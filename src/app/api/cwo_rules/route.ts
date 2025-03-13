import { NextResponse } from "next/server";
import {
  getAllCwoRules,
  createCwoRule,
  createCwoRules,
} from "@/services/cwo_rules/CwoRuleService";

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
    const body = await request.json();

    // Check if it's a batch operation
    if (Array.isArray(body)) {
      const newRules = await createCwoRules(body);
      return NextResponse.json(newRules, { status: 201 });
    } else {
      const newRule = await createCwoRule(body);
      return NextResponse.json(newRule, { status: 201 });
    }
  } catch (error: any) {
    console.error(error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
