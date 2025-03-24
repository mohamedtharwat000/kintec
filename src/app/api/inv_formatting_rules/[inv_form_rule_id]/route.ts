import { NextResponse } from "next/server";
import {
  getInvoiceFormattingRuleById,
  updateInvoiceFormattingRule,
  deleteInvoiceFormattingRule,
} from "@/services/invoice_formatting_rules/invoiceFormattingRuleService";
import { Prisma } from "@prisma/client";

export async function GET(
  request: Request,
  context: { params: Promise<{ inv_for_rule_id: string }> }
) {
  try {
    const { inv_for_rule_id } = await context.params;

    const inv_for_rule = await getInvoiceFormattingRuleById(inv_for_rule_id);
    if (!inv_for_rule) {
      return NextResponse.json(
        { error: "Invoice Formatting Rule not found" },
        { status: 404 }
      );
    }
    return NextResponse.json(inv_for_rule, { status: 200 });
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
  context: { params: Promise<{ inv_for_rule_id: string }> }
) {
  try {
    const { inv_for_rule_id } = await context.params;
    const body = await request.json();
    const updated = await updateInvoiceFormattingRule(inv_for_rule_id, body);
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
  context: { params: Promise<{ inv_form_rule_id: string }> }
) {
  try {
    const { inv_form_rule_id } = await context.params;
    await deleteInvoiceFormattingRule(inv_form_rule_id);

    return NextResponse.json(
      { message: "Invoice Formatting Rule deleted successfully" },
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
