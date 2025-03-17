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
    const requestData:
      | APIExpenseValidationRuleData
      | APIExpenseValidationRuleData[] = await request.json();
    const expValRules = await createExpenseValidationRule(requestData);

    return NextResponse.json(expValRules, { status: 201 });
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
