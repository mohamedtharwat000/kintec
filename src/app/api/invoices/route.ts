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
    console.error(error.code);
    //Contract does not point at a contractor, client_company or a project
    //   if (error instanceof Error && "code" in error && error.code === "P2025") {
    //       return NextResponse.json({ error: "Invalid Request" }, { status: 400 });
    //     }
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
