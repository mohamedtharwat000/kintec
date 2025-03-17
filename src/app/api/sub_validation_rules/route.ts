import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import {
  getAllSubmissionValidationRules,
  createSubmissionValidationRule,
} from "@/services/submission_validation_rules/submissionValidationRuleService";
import { APISubmissionValidationRuleData } from "@/types/SubmissionValidationRule";

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
    const requestData:
      | APISubmissionValidationRuleData
      | APISubmissionValidationRuleData[] = await request.json();
    const rules = await createSubmissionValidationRule(requestData);

    return NextResponse.json(rules, { status: 201 });
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
