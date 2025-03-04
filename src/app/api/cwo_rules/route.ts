import { NextResponse } from "next/server";
import {
  getAllCwoRules,
  createCwoRule,
} from "@/services/cwo_rules/CwoRuleService";

export async function GET() {
  try {
    const cwo_rules = await getAllCwoRules();
    return NextResponse.json(cwo_rules, { status: 200 });
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
    const newCwoRule = await createCwoRule(body);
    return NextResponse.json(newCwoRule, { status: 201 });
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
