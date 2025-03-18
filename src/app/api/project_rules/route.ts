import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import {
  getAllProjectRules,
  createProjectRule,
} from "@/services/project_rules/projectRuleService";
import { APIProjectRuleData } from "@/types/ProjectRule";

export async function GET() {
  try {
    const projectRules = await getAllProjectRules();
    return NextResponse.json(projectRules, { status: 200 });
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
    const requestData: APIProjectRuleData | APIProjectRuleData[] =
      await request.json();
    const projectRules = await createProjectRule(requestData);

    return NextResponse.json(projectRules, { status: 201 });
  } catch (err) {
    const isPrismaError = err instanceof Prisma.PrismaClientKnownRequestError;
    const error = err instanceof Error ? err : new Error("Unknown error");
    return NextResponse.json(
      { error: error.message },
      { status: isPrismaError ? 400 : 500 }
    );
  }
}
