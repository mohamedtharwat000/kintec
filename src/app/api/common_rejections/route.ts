import { NextResponse } from "next/server";
import {
  getAllCommonRejections,
  createCommonRejection,
} from "@/services/common_rejections/commonRejectionService";

export async function GET() {
  try {
    const rejections = await getAllCommonRejections();
    return NextResponse.json(rejections, { status: 200 });
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
    const newRejection = await createCommonRejection(body);
    return NextResponse.json(newRejection, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
