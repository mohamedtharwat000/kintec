import { NextResponse } from "next/server";
import {
  getInvoiceFormattingRuleById,
  updateInvoiceFormattingRule,
  deleteInvoiceFormattingRule,
} from "@/services/invoice_formatting_rules/invoiceFormattingRuleService";

export async function GET(
  request: Request,
  context: { params: { inv_for_rule_id: string } }
) {
  try {
    const params = await context.params;

    const inv_for_rule = await getInvoiceFormattingRuleById(
      params.inv_for_rule_id
    );
    if (!inv_for_rule) {
      return NextResponse.json(
        { error: "Invoice Formatting Rule not found" },
        { status: 404 }
      );
    }
    return NextResponse.json(inv_for_rule, { status: 200 });
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
  context: { params: { inv_for_rule_id: string } }
) {
  try {
    const params = await context.params;
    //console.log("here1");
    const body = await request.json();
    //console.log("here2");
    const updated = await updateInvoiceFormattingRule(
      params.inv_for_rule_id,
      body
    );
    //console.log("here3");
    return NextResponse.json(updated, { status: 200 });
  } catch (error: any) {
    //console.log("inside catch");
    //console.error(error.code);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  context: { params: { inv_for_rule_id: string } }
) {
  try {
    const params = await context.params;
    await deleteInvoiceFormattingRule(params.inv_for_rule_id);
    // 204 responses typically have no body.
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    //console.error(error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
