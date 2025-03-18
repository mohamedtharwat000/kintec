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
  } catch (err) {
    const isPrismaError = err instanceof Prisma.PrismaClientKnownRequestError;
    const error = err instanceof Error ? err : new Error("Unknown error");
    return NextResponse.json(
      { error: error.message },
      { status: isPrismaError ? 400 : 500 }
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
  } catch (err) {
    const isPrismaError = err instanceof Prisma.PrismaClientKnownRequestError;
    const error = err instanceof Error ? err : new Error("Unknown error");
    return NextResponse.json(
      { error: error.message },
      { status: isPrismaError ? 400 : 500 }
    );
  }
}
