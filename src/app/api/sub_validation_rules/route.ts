import { NextResponse } from "next/server";
import {
  getAllSubmissionValidationRules,
  createSubmissionValidationRule,
} from "@/services/submission_validation_rules/submissionValidationRuleService";

export async function GET() {
  try {
    const sub_val_rules = await getAllSubmissionValidationRules();
    return NextResponse.json(sub_val_rules, { status: 200 });
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
    const newSubValRule = await createSubmissionValidationRule(body);
    return NextResponse.json(newSubValRule, { status: 201 });
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
