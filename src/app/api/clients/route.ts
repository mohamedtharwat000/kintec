import { NextResponse } from "next/server";
import { ClientCompany } from "@/types/client";

export async function GET() {
  const dummyClients: ClientCompany[] = [
    {
      client_company_id: "client1",
      client_company_name: "ACME Corp",
      contact_email: "contact@acme.com",
      contracts: [
        {
          contract_id: "contract1",
          contractor_id: "contractor1",
          client_company_id: "client1",
          contract_start_date: "2023-01-01",
          contract_end_date: "2023-12-31",
          job_title: "Developer",
          job_type: "Full-time",
          contract_status: "Active",
          purchase_orders: [
            {
              PO_id: "PO1",
              PO_start_date: "2023-01-15",
              PO_end_date: "2023-02-15",
              contract_id: "contract1",
              PO_total_value: 10000,
              PO_status: "Paid",
              kintec_email_for_remittance: "remit@acme.com",
              invoice: {
                invoice_id: "invoice1",
                PO_id: "PO1",
                billing_period: "2023-01",
                invoice_status: "Paid",
                invoice_total_value: 10000,
                invoice_currency: "USD",
              },
              rate: {
                rate_id: "rate1",
                PO_id: "PO1",
                rate_type: "Hourly",
                rate_frequency: "Weekly",
                rate_value: 50,
                rate_currency: "USD",
              },
            },
          ],
        },
        {
          contract_id: "contract3",
          contractor_id: "contractor1",
          client_company_id: "client1",
          contract_start_date: "2024-01-01",
          contract_end_date: "2024-12-31",
          job_title: "Senior Developer",
          job_type: "Full-time",
          contract_status: "Upcoming",
          purchase_orders: [
            {
              PO_id: "PO3",
              PO_start_date: "2024-01-15",
              PO_end_date: "2024-02-15",
              contract_id: "contract3",
              PO_total_value: 15000,
              PO_status: "Scheduled",
              kintec_email_for_remittance: "remit@acme.com",
              invoice: {
                invoice_id: "invoice3",
                PO_id: "PO3",
                billing_period: "2024-01",
                invoice_status: "Pending",
                invoice_total_value: 15000,
                invoice_currency: "USD",
              },
              rate: {
                rate_id: "rate3",
                PO_id: "PO3",
                rate_type: "Hourly",
                rate_frequency: "Weekly",
                rate_value: 70,
                rate_currency: "USD",
              },
            },
          ],
        },
      ],
    },
    {
      client_company_id: "client2",
      client_company_name: "Beta Inc",
      contact_email: "hello@beta.com",
      contracts: [
        {
          contract_id: "contract2",
          contractor_id: "contractor2",
          client_company_id: "client2",
          contract_start_date: "2023-03-01",
          contract_end_date: "2023-09-30",
          job_title: "Designer",
          job_type: "Contract",
          contract_status: "Pending",
          purchase_orders: [
            {
              PO_id: "PO2",
              PO_start_date: "2023-03-10",
              PO_end_date: "2023-04-10",
              contract_id: "contract2",
              PO_total_value: 8000,
              PO_status: "Unpaid",
              kintec_email_for_remittance: "finance@beta.com",
              invoice: {
                invoice_id: "invoice2",
                PO_id: "PO2",
                billing_period: "2023-03",
                invoice_status: "Unpaid",
                invoice_total_value: 8000,
                invoice_currency: "GBP",
              },
              rate: {
                rate_id: "rate2",
                PO_id: "PO2",
                rate_type: "Fixed",
                rate_frequency: "Monthly",
                rate_value: 4000,
                rate_currency: "GBP",
              },
            },
          ],
        },
        {
          contract_id: "contract4",
          contractor_id: "contractor2",
          client_company_id: "client2",
          contract_start_date: "2024-04-01",
          contract_end_date: "2024-10-31",
          job_title: "Lead Designer",
          job_type: "Contract",
          contract_status: "Upcoming",
          purchase_orders: [
            {
              PO_id: "PO4",
              PO_start_date: "2024-04-10",
              PO_end_date: "2024-05-10",
              contract_id: "contract4",
              PO_total_value: 9000,
              PO_status: "Scheduled",
              kintec_email_for_remittance: "finance@beta.com",
              invoice: {
                invoice_id: "invoice4",
                PO_id: "PO4",
                billing_period: "2024-04",
                invoice_status: "Pending",
                invoice_total_value: 9000,
                invoice_currency: "GBP",
              },
              rate: {
                rate_id: "rate4",
                PO_id: "PO4",
                rate_type: "Fixed",
                rate_frequency: "Monthly",
                rate_value: 4500,
                rate_currency: "GBP",
              },
            },
          ],
        },
      ],
    },
  ];

  return NextResponse.json<{ clients: ClientCompany[] }>({
    clients: dummyClients,
  });
}
