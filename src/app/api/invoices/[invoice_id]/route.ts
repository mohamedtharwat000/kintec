import { NextResponse } from "next/server";
import {
  getInvoiceById,
  updateInvoice,
  deleteInvoice,
} from "@/services/invoices/invoiceService";

export async function GET(
  request: Request,
  context: { params: { invoice_id: string } }
) {
  try {
    const params = await context.params;

    const invoice = await getInvoiceById(params.invoice_id);
    if (!invoice) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
    }
    return NextResponse.json(invoice, { status: 200 });
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
  context: { params: { invoice_id: string } }
) {
  try {
    const params = await context.params;
    //console.log("here1");
    const body = await request.json();
    //console.log("here2");
    const updated = await updateInvoice(params.invoice_id, body);
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
  context: { params: { invoice_id: string } }
) {
  try {
    const params = await context.params;
    await deleteInvoice(params.invoice_id);
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
