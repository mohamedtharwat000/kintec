import { NextResponse } from "next/server";
import {
  getProjectRuleById,
  updateProjectRule,
  deleteProjectRule,
} from "@/services/project_rules/projectRuleService";

export async function GET(
  request: Request,
  context: { params: { project_rule_id: string } }
) {
  try {
    const params = await context.params;

    const project_rule = await getProjectRuleById(params.project_rule_id);
    if (!project_rule) {
      return NextResponse.json(
        { error: "Project rule not found" },
        { status: 404 }
      );
    }
    return NextResponse.json(project_rule, { status: 200 });
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
  context: { params: { project_rule_id: string } }
) {
  try {
    const params = await context.params;
    const body = await request.json();
    const updated = await updateProjectRule(params.project_rule_id, body);
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
  context: { params: { project_rule_id: string } }
) {
  try {
    const params = await context.params;
    await deleteProjectRule(params.project_rule_id);
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
