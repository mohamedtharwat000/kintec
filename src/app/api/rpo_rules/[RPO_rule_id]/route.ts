import { NextResponse } from "next/server";
import {
  getRpoRuleById,
  updateRpoRule,
  deleteRpoRule,
} from "@/services/rpo_rules/RpoRuleService";

export async function GET(
  request: Request,
  context: { params: { RPO_rule_id: string } }
) {
  try {
    const params = await context.params;

    const RPO_rule = await getRpoRuleById(params.RPO_rule_id);
    if (!RPO_rule) {
      return NextResponse.json(
        { error: "RPO rule not found" },
        { status: 404 }
      );
    }
    return NextResponse.json(RPO_rule, { status: 200 });
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
  context: { params: { RPO_rule_id: string } }
) {
  try {
    const params = await context.params;
    //console.log("here1");
    const body = await request.json();
    //console.log("here2");
    const updated = await updateRpoRule(params.RPO_rule_id, body);
    //console.log("here3");
    return NextResponse.json(updated, { status: 200 });
  } catch (error: any) {
    //console.log("inside catch");
    //console.error(error.code);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  context: { params: { RPO_rule_id: string } }
) {
  try {
    const params = await context.params;
    await deleteRpoRule(params.RPO_rule_id);
    // 204 responses typically have no body.
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    //console.error(error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
