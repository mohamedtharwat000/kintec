import { NextResponse } from "next/server";
import {
  getAllRpoRules,
  createRpoRule,
  createRpoRules,
} from "@/services/rpo_rules/RpoRuleService";

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
    const body = await request.json();

    // Check if it's a batch operation
    if (Array.isArray(body)) {
      const newRules = await createRpoRules(body);
      return NextResponse.json(newRules, { status: 201 });
    } else {
      const newRule = await createRpoRule(body);
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
