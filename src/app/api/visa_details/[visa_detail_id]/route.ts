import { NextResponse } from "next/server";
import {
  getVisaDetailById,
  updateVisaDetail,
  deleteVisaDetail,
} from "@/services/visa_details/visaDetailService";

export async function GET(
  request: Request,
  context: { params: { visa_detail_id: string } }
) {
  try {
    const params = await context.params;

    const visaDetail = await getVisaDetailById(params.visa_detail_id);
    if (!visaDetail) {
      return NextResponse.json(
        { error: "Visa detail not found" },
        { status: 404 }
      );
    }
    return NextResponse.json(visaDetail, { status: 200 });
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
  context: { params: { visa_detail_id: string } }
) {
  try {
    const params = await context.params;
    const body = await request.json();
    const updated = await updateVisaDetail(params.visa_detail_id, body);
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
  context: { params: { visa_detail_id: string } }
) {
  try {
    const params = await context.params;
    await deleteVisaDetail(params.visa_detail_id);
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
