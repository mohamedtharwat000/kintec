import { NextResponse } from "next/server";
import {
  getProjectRuleById,
  updateProjectRule,
  deleteProjectRule,
} from "@/services/project_rules/projectRuleService";
import { Prisma } from "@prisma/client";

export async function GET(
  request: Request,
  context: { params: Promise<{ project_rule_id: string }> }
) {
  try {
    const { project_rule_id } = await context.params;

    const project_rule = await getProjectRuleById(project_rule_id);
    if (!project_rule) {
      return NextResponse.json(
        { error: "Project rule not found" },
        { status: 404 }
      );
    }
    return NextResponse.json(project_rule, { status: 200 });
  } catch (err) {
    const isPrismaError = err instanceof Prisma.PrismaClientKnownRequestError;
    const error = err instanceof Error ? err : new Error("Unknown error");
    return NextResponse.json(
      { error: error.message },
      { status: isPrismaError ? 400 : 500 }
    );
  }
}

export async function PUT(
  request: Request,
  context: { params: Promise<{ project_rule_id: string }> }
) {
  try {
    const { project_rule_id } = await context.params;
    const body = await request.json();
    const updated = await updateProjectRule(project_rule_id, body);
    return NextResponse.json(updated, { status: 200 });
  } catch (err) {
    const isPrismaError = err instanceof Prisma.PrismaClientKnownRequestError;
    const error = err instanceof Error ? err : new Error("Unknown error");
    return NextResponse.json(
      { error: error.message },
      { status: isPrismaError ? 400 : 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  context: { params: Promise<{ project_rule_id: string }> }
) {
  try {
    const { project_rule_id } = await context.params;
    await deleteProjectRule(project_rule_id);
    return NextResponse.json(
      { message: "Project Rule deleted successfully" },
      { status: 200 }
    );
  } catch (err) {
    const isPrismaError = err instanceof Prisma.PrismaClientKnownRequestError;
    const error = err instanceof Error ? err : new Error("Unknown error");
    return NextResponse.json(
      { error: error.message },
      { status: isPrismaError ? 400 : 500 }
    );
  }
}
