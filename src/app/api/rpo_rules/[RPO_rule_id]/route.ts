import { NextResponse } from "next/server";
import {
  getRpoRuleById,
  updateRpoRule,
  deleteRpoRule,
} from "@/services/rpo_rules/RpoRuleService";
import { Prisma } from "@prisma/client";

export async function GET(
  request: Request,
  context: { params: Promise<{ RPO_rule_id: string }> }
) {
  try {
    const { RPO_rule_id } = await context.params;

    const RPO_rule = await getRpoRuleById(RPO_rule_id);
    if (!RPO_rule) {
      return NextResponse.json(
        { error: "RPO Rule not found" },
        { status: 404 }
      );
    }
    return NextResponse.json(RPO_rule, { status: 200 });
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
  context: { params: Promise<{ RPO_rule_id: string }> }
) {
  try {
    const { RPO_rule_id } = await context.params;
    const body = await request.json();
    const updated = await updateRpoRule(RPO_rule_id, body);
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
  context: { params: Promise<{ RPO_rule_id: string }> }
) {
  try {
    const { RPO_rule_id } = await context.params;
    await deleteRpoRule(RPO_rule_id);
    return NextResponse.json(
      { message: "RPO Rule deleted successfully" },
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
