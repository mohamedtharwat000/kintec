import { NextResponse } from "next/server";
import {
  getVisaDetailById,
  updateVisaDetail,
  deleteVisaDetail,
} from "@/services/visa_details/visaDetailService";
import { Prisma } from "@prisma/client";

export async function GET(
  request: Request,
  context: { params: Promise<{ visa_detail_id: string }> }
) {
  try {
    const { visa_detail_id } = await context.params;

    const visaDetail = await getVisaDetailById(visa_detail_id);
    if (!visaDetail) {
      return NextResponse.json(
        { error: "Visa detail not found" },
        { status: 404 }
      );
    }
    return NextResponse.json(visaDetail, { status: 200 });
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
  context: { params: Promise<{ visa_detail_id: string }> }
) {
  try {
    const { visa_detail_id } = await context.params;
    const body = await request.json();
    const updated = await updateVisaDetail(visa_detail_id, body);
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
  context: { params: Promise<{ visa_detail_id: string }> }
) {
  try {
    const { visa_detail_id } = await context.params;
    await deleteVisaDetail(visa_detail_id);
    return NextResponse.json(
      { message: "Visa detail deleted successfully" },
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
