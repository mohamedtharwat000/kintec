import { NextResponse } from "next/server";
import {
  getAllExpenses,
  createExpense,
} from "@/services/expenses/expenseService";

export async function GET() {
  try {
    const rates = await getAllExpenses();
    return NextResponse.json(rates, { status: 200 });
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
    const newExpense = await createExpense(body);
    return NextResponse.json(newExpense, { status: 201 });
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
