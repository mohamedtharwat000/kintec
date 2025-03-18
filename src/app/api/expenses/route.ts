import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import {
  getAllExpenses,
  createExpense,
} from "@/services/expenses/expenseService";
import { APIExpenseData } from "@/types/Expense";

export async function GET() {
  try {
    const expenses = await getAllExpenses();
    return NextResponse.json(expenses, { status: 200 });
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
    const requestData: APIExpenseData | APIExpenseData[] = await request.json();
    const expenses = await createExpense(requestData);

    return NextResponse.json(expenses, { status: 201 });
  } catch (err) {
    const isPrismaError = err instanceof Prisma.PrismaClientKnownRequestError;
    const error = err instanceof Error ? err : new Error("Unknown error");
    return NextResponse.json(
      { error: error.message },
      { status: isPrismaError ? 400 : 500 }
    );
  }
}
