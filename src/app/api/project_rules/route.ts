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
    const requestData: APIProjectRuleData | APIProjectRuleData[] =
      await request.json();
    const projectRules = await createProjectRule(requestData);

    return NextResponse.json(projectRules, { status: 201 });
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
