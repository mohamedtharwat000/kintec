import { NextResponse } from "next/server";
import {
  getAllExpenseValidationRules,
  createExpenseValidationRule,
} from "@/services/expense_validation_rules/expenseValidationRuleService";

export async function GET() {
  try {
    const exp_val_rules = await getAllExpenseValidationRules();
    return NextResponse.json(exp_val_rules, { status: 200 });
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
    const newExpValRule = await createExpenseValidationRule(body);
    return NextResponse.json(newExpValRule, { status: 201 });
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
