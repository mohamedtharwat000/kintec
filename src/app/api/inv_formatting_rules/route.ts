import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import {
  getAllInvoiceFormattingRules,
  createInvoiceFormattingRule,
} from "@/services/invoice_formatting_rules/invoiceFormattingRuleService";
import { APIInvoiceFormattingRuleData } from "@/types/InvoiceFormattingRule";

export async function GET() {
  try {
    const invFormattingRules = await getAllInvoiceFormattingRules();
    return NextResponse.json(invFormattingRules, { status: 200 });
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
      | APIInvoiceFormattingRuleData
      | APIInvoiceFormattingRuleData[] = await request.json();
    const invFormattingRules = await createInvoiceFormattingRule(requestData);

    return NextResponse.json(invFormattingRules, { status: 201 });
  } catch (err) {
    const isPrismaError = err instanceof Prisma.PrismaClientKnownRequestError;
    const error = err instanceof Error ? err : new Error("Unknown error");
    return NextResponse.json(
      { error: error.message },
      { status: isPrismaError ? 400 : 500 }
    );
  }
}
