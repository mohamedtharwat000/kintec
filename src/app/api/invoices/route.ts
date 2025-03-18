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
  } catch (err) {
    const isPrismaError = err instanceof Prisma.PrismaClientKnownRequestError;
    const error = err instanceof Error ? err : new Error("Unknown error");
    return NextResponse.json(
      { error: error.message },
      { status: isPrismaError ? 400 : 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const requestData: APIInvoiceData | APIInvoiceData[] = await request.json();
    const invoices = await createInvoice(requestData);

    return NextResponse.json(invoices, { status: 201 });
  } catch (err) {
    const isPrismaError = err instanceof Prisma.PrismaClientKnownRequestError;
    const error = err instanceof Error ? err : new Error("Unknown error");
    return NextResponse.json(
      { error: error.message },
      { status: isPrismaError ? 400 : 500 }
    );
  }
}
