import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import {
  getAllExpenseValidationRules,
  createExpenseValidationRule,
} from "@/services/expense_validation_rules/expenseValidationRuleService";
import { APIExpenseValidationRuleData } from "@/types/ExpenseValidationRule";

export async function GET() {
  try {
    const expValRules = await getAllExpenseValidationRules();
    return NextResponse.json(expValRules, { status: 200 });
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
    const requestData:
      | APIExpenseValidationRuleData
      | APIExpenseValidationRuleData[] = await request.json();
    const expValRules = await createExpenseValidationRule(requestData);

    return NextResponse.json(expValRules, { status: 201 });
  } catch (err) {
    const isPrismaError = err instanceof Prisma.PrismaClientKnownRequestError;
    const error = err instanceof Error ? err : new Error("Unknown error");
    return NextResponse.json(
      { error: error.message },
      { status: isPrismaError ? 400 : 500 }
    );
  }
}
