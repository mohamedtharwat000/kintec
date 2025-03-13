import { NextResponse } from "next/server";
import {
  getSubmissionValidationRuleById,
  updateSubmissionValidationRule,
  deleteSubmissionValidationRule,
} from "@/services/submission_validation_rules/submissionValidationRuleService";

export async function GET(
  request: Request,
  context: { params: { sub_val_rule_id: string } }
) {
  try {
    const params = await context.params;

    const rule = await getSubmissionValidationRuleById(params.sub_val_rule_id);
    if (!rule) {
      return NextResponse.json(
        { error: "Validation rule not found" },
        { status: 404 }
      );
    }
    return NextResponse.json(rule, { status: 200 });
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
  context: { params: { sub_val_rule_id: string } }
) {
  try {
    const params = await context.params;
    const body = await request.json();
    const updated = await updateSubmissionValidationRule(
      params.sub_val_rule_id,
      body
    );
    return NextResponse.json(updated, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  context: { params: { sub_val_rule_id: string } }
) {
  try {
    const params = await context.params;
    await deleteSubmissionValidationRule(params.sub_val_rule_id);
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
