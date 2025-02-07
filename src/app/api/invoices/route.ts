import { NextResponse } from "next/server";
import { Invoice } from "@/types/contract";

export async function GET() {
  const dummyInvoices: Invoice[] = [
    {
      invoice_id: "invoice1",
      PO_id: "PO1",
      billing_period: "2023-01",
      invoice_status: "Paid",
      invoice_total_value: 10000,
      invoice_currency: "USD",
    },
    {
      invoice_id: "invoice2",
      PO_id: "PO2",
      billing_period: "2023-03",
      invoice_status: "Unpaid",
      invoice_total_value: 8000,
      invoice_currency: "GBP",
    },
    {
      invoice_id: "invoice3",
      PO_id: "PO3",
      billing_period: "2024-01",
      invoice_status: "Pending",
      invoice_total_value: 15000,
      invoice_currency: "USD",
    },
    {
      invoice_id: "invoice4",
      PO_id: "PO4",
      billing_period: "2024-04",
      invoice_status: "Pending",
      invoice_total_value: 9000,
      invoice_currency: "GBP",
    },
  ];

  return NextResponse.json({ invoices: dummyInvoices });
}
