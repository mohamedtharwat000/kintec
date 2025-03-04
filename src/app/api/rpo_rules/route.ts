import { NextResponse } from "next/server";
import {
  getAllRpoRules,
  createRpoRule,
} from "@/services/rpo_rules/RpoRuleService";

export async function GET() {
  try {
    const rpo_rules = await getAllRpoRules();
    return NextResponse.json(rpo_rules, { status: 200 });
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
    const newRpoRule = await createRpoRule(body);
    return NextResponse.json(newRpoRule, { status: 201 });
  } catch (error: any) {
    console.error(error.code);

    //    if (error instanceof Error && "code" in error && error.code === "P2014") {
    //        return NextResponse.json({ error: "Invalid Request" }, { status: 400 });
    //      }
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
