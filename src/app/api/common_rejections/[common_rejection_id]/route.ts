import { NextResponse } from "next/server";
import {
  getCommonRejectionById,
  updateCommonRejection,
  deleteCommonRejection,
} from "@/services/common_rejections/commonRejectionService";

export async function GET(
  request: Request,
  context: { params: { common_rejection_id: string } }
) {
  try {
    const { common_rejection_id } = context.params;
    const rejection = await getCommonRejectionById(common_rejection_id);
    if (!rejection) {
      return NextResponse.json(
        { error: "Common rejection not found" },
        { status: 404 }
      );
    }
    return NextResponse.json(rejection, { status: 200 });
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
  context: { params: { common_rejection_id: string } }
) {
  try {
    const { common_rejection_id } = context.params;
    const body = await request.json();
    const updated = await updateCommonRejection(common_rejection_id, body);
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
  context: { params: { common_rejection_id: string } }
) {
  try {
    const { common_rejection_id } = context.params;
    await deleteCommonRejection(common_rejection_id);
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
