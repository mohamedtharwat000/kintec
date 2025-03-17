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
    const requestData: APIExpenseData | APIExpenseData[] = await request.json();
    const expenses = await createExpense(requestData);

    return NextResponse.json(expenses, { status: 201 });
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
