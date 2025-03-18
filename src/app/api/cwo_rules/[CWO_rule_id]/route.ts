import { NextResponse } from "next/server";
import {
  getCwoRuleById,
  updateCwoRule,
  deleteCwoRule,
} from "@/services/cwo_rules/CwoRuleService";
import { Prisma } from "@prisma/client";

export async function GET(
  request: Request,
  context: { params: Promise<{ CWO_rule_id: string }> }
) {
  try {
    const { CWO_rule_id } = await context.params;

    const CWO_rule = await getCwoRuleById(CWO_rule_id);
    if (!CWO_rule) {
      return NextResponse.json(
        { error: "CWO Rule not found" },
        { status: 404 }
      );
    }
    return NextResponse.json(CWO_rule, { status: 200 });
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
  context: { params: Promise<{ CWO_rule_id: string }> }
) {
  try {
    const { CWO_rule_id } = await context.params;
    const body = await request.json();
    const updated = await updateCwoRule(CWO_rule_id, body);
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
  context: { params: Promise<{ CWO_rule_id: string }> }
) {
  try {
    const { CWO_rule_id } = await context.params;
    await deleteCwoRule(CWO_rule_id);
    return NextResponse.json(
      { message: "CWO Rule deleted successfully" },
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
