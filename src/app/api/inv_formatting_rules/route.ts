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
      | APIInvoiceFormattingRuleData
      | APIInvoiceFormattingRuleData[] = await request.json();
    const invFormattingRules = await createInvoiceFormattingRule(requestData);

    return NextResponse.json(invFormattingRules, { status: 201 });
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
