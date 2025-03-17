import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import {
  getAllInvoices,
  createInvoice,
} from "@/services/invoices/invoiceService";
import { APIInvoiceData } from "@/types/Invoice";

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
    const requestData: APIInvoiceData | APIInvoiceData[] = await request.json();
    const invoices = await createInvoice(requestData);

    return NextResponse.json(invoices, { status: 201 });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    } else {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
  }
}
