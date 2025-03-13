import { NextResponse } from "next/server";
import {
  getBankDetailById,
  updateBankDetail,
  deleteBankDetail,
} from "@/services/bank_details/bankDetailService";

export async function GET(
  request: Request,
  context: { params: { bank_detail_id: string } }
) {
  try {
    const params = await context.params;

    const bankDetail = await getBankDetailById(params.bank_detail_id);
    if (!bankDetail) {
      return NextResponse.json(
        { error: "Bank detail not found" },
        { status: 404 }
      );
    }
    return NextResponse.json(bankDetail, { status: 200 });
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
  context: { params: { bank_detail_id: string } }
) {
  try {
    const params = await context.params;
    const body = await request.json();
    const updated = await updateBankDetail(params.bank_detail_id, body);
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
  context: { params: { bank_detail_id: string } }
) {
  try {
    const params = await context.params;
    await deleteBankDetail(params.bank_detail_id);
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
