import { NextResponse } from "next/server";
import {
  getSubmissionValidationRuleById,
  updateSubmissionValidationRule,
  deleteSubmissionValidationRule,
} from "@/services/submission_validation_rules/submissionValidationRuleService";
import { Prisma } from "@prisma/client";

export async function GET(
  request: Request,
  context: { params: Promise<{ sub_val_rule_id: string }> }
) {
  try {
    const { sub_val_rule_id } = await context.params;

    const rule = await getSubmissionValidationRuleById(sub_val_rule_id);
    if (!rule) {
      return NextResponse.json(
        { error: "Validation rule not found" },
        { status: 404 }
      );
    }
    return NextResponse.json(rule, { status: 200 });
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
  context: { params: Promise<{ sub_val_rule_id: string }> }
) {
  try {
    const { sub_val_rule_id } = await context.params;
    const body = await request.json();
    const updated = await updateSubmissionValidationRule(sub_val_rule_id, body);
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
  context: { params: Promise<{ sub_val_rule_id: string }> }
) {
  try {
    const { sub_val_rule_id } = await context.params;
    await deleteSubmissionValidationRule(sub_val_rule_id);
    return NextResponse.json(
      { message: "Submission Validation Rule deleted successfully" },
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
