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

    const sub_val_rule = await getSubmissionValidationRuleById(
      params.sub_val_rule_id
    );
    if (!sub_val_rule) {
      return NextResponse.json(
        { error: "Submission validation rule not found" },
        { status: 404 }
      );
    }
    return NextResponse.json(sub_val_rule, { status: 200 });
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
    //console.log("here1");
    const body = await request.json();
    //console.log("here2");
    const updated = await updateSubmissionValidationRule(
      params.sub_val_rule_id,
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
  context: { params: { sub_val_rule_id: string } }
) {
  try {
    const params = await context.params;
    await deleteSubmissionValidationRule(params.sub_val_rule_id);
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
