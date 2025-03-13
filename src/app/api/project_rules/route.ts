import { NextResponse } from "next/server";
import {
  getAllProjectRules,
  createProjectRule,
} from "@/services/project_rules/projectRuleService";

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
    const body = await request.json();
    const newProjectRule = await createProjectRule(body);
    return NextResponse.json(newProjectRule, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
