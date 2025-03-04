import { NextResponse } from "next/server";
import {
  getAllInvoiceFormattingRules,
  createInvoiceFormattingRule,
} from "@/services/invoice_formatting_rules/invoiceFormattingRuleService";

export async function GET() {
  try {
    const inv_for_rules = await getAllInvoiceFormattingRules();
    return NextResponse.json(inv_for_rules, { status: 200 });
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
    const newInvForRule = await createInvoiceFormattingRule(body);
    return NextResponse.json(newInvForRule, { status: 201 });
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
