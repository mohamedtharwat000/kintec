import { NextResponse } from "next/server";
import {
  getAllSubmissionValidationRules,
  createSubmissionValidationRule,
} from "@/services/submission_validation_rules/submissionValidationRuleService";

export async function GET() {
  try {
    const rules = await getAllSubmissionValidationRules();
    return NextResponse.json(rules, { status: 200 });
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
    const newRule = await createSubmissionValidationRule(body);
    return NextResponse.json(newRule, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
