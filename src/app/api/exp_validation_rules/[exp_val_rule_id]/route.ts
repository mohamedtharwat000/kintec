import { NextResponse } from "next/server";
import {
  getExpenseValidationRuleById,
  updateExpenseValidationRule,
  deleteExpenseValidationRule,
} from "@/services/expense_validation_rules/expenseValidationRuleService";
import { Prisma } from "@prisma/client";

export async function GET(
  request: Request,
  context: { params: Promise<{ exp_val_rule_id: string }> }
) {
  try {
    const { exp_val_rule_id } = await context.params;

    const rule = await getExpenseValidationRuleById(exp_val_rule_id);
    if (!rule) {
      return NextResponse.json({ error: "Rule not found" }, { status: 404 });
    }
    return NextResponse.json(rule, { status: 200 });
  } catch (err) {
    const isPrismaError = err instanceof Prisma.PrismaClientKnownRequestError;
    const error = err instanceof Error ? err : new Error("Unknown error");
    return NextResponse.json(
      { error: error.message },
      { status: isPrismaError ? 400 : 500 }
    );
  }
}

export async function PUT(
  request: Request,
  context: { params: Promise<{ exp_val_rule_id: string }> }
) {
  try {
    const { exp_val_rule_id } = await context.params;
    const body = await request.json();
    const updated = await updateExpenseValidationRule(exp_val_rule_id, body);
    return NextResponse.json(updated, { status: 200 });
  } catch (err) {
    const isPrismaError = err instanceof Prisma.PrismaClientKnownRequestError;
    const error = err instanceof Error ? err : new Error("Unknown error");
    return NextResponse.json(
      { error: error.message },
      { status: isPrismaError ? 400 : 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  context: { params: Promise<{ exp_val_rule_id: string }> }
) {
  try {
    const { exp_val_rule_id } = await context.params;
    await deleteExpenseValidationRule(exp_val_rule_id);
    return NextResponse.json(
      { message: "Expense Validation Rule deleted successfully" },
      { status: 200 }
    );
  } catch (err) {
    const isPrismaError = err instanceof Prisma.PrismaClientKnownRequestError;
    const error = err instanceof Error ? err : new Error("Unknown error");
    return NextResponse.json(
      { error: error.message },
      { status: isPrismaError ? 400 : 500 }
    );
  }
}
