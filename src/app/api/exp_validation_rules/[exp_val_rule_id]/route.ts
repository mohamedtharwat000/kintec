import { NextResponse } from "next/server";
import {
  getExpenseValidationRuleById,
  updateExpenseValidationRule,
  deleteExpenseValidationRule,
} from "@/services/expense_validation_rules/expenseValidationRuleService";

export async function GET(
  request: Request,
  context: { params: { exp_val_rule_id: string } }
) {
  try {
    const params = await context.params;

    const rule = await getExpenseValidationRuleById(params.exp_val_rule_id);
    if (!rule) {
      return NextResponse.json({ error: "Rule not found" }, { status: 404 });
    }
    return NextResponse.json(rule, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  context: { params: { exp_val_rule_id: string } }
) {
  try {
    const params = await context.params;
    const body = await request.json();
    const updated = await updateExpenseValidationRule(
      params.exp_val_rule_id,
      body
    );
    return NextResponse.json(updated, { status: 200 });
  } catch (error: any) {
    console.error(error.code);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  context: { params: { exp_val_rule_id: string } }
) {
  try {
    const params = await context.params;
    await deleteExpenseValidationRule(params.exp_val_rule_id);
    // 204 responses typically have no body.
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
