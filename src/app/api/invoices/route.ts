import { NextResponse } from "next/server";
import {
  getAllInvoices,
  createInvoice,
} from "@/services/invoices/invoiceService";

export async function GET() {
  try {
    const invoices = await getAllInvoices();
    return NextResponse.json(invoices, { status: 200 });
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
    const newInvoice = await createInvoice(body);
    return NextResponse.json(newInvoice, { status: 201 });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
