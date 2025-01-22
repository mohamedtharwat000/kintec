import { NextResponse } from "next/server";
import type { Invoice, InvoicesResponse } from "@/types/invoices";

export async function GET() {
  const dummyInvoices: Invoice[] = [
    { id: 1, client: "Client A", amount: 1500, date: "2023-12-01" },
    { id: 2, client: "Client B", amount: 2300, date: "2023-12-02" },
    { id: 3, client: "Client C", amount: 800, date: "2023-12-03" },
  ];

  return NextResponse.json<InvoicesResponse>({ invoices: dummyInvoices });
}
