import { useInvoices } from "@/hooks/useApp";
import { Loader2 } from "lucide-react";

export function Invoices() {
  const { data, isLoading, isError, error } = useInvoices();

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="h-full flex items-center justify-center">
        <p>Error: {(error as Error)?.message || "Unknown error"}</p>
      </div>
    );
  }

  return (
    <div className="h-full p-4 overflow-auto">
      <h3 className="text-xl font-semibold mb-4">Invoices</h3>
      <div className="grid grid-cols-1 gap-4">
        {data?.map((invoice) => (
          <div
            key={invoice.invoice_id}
            className="card shadow-lg rounded-lg border bg-white p-4"
          >
            <div className="grid grid-cols-2 gap-4">
              <p>
                <span className="font-medium text-gray-800">Invoice ID:</span>{" "}
                {invoice.invoice_id}
              </p>
              <p>
                <span className="font-medium text-gray-800">PO ID:</span>{" "}
                {invoice.PO_id}
              </p>
              <p>
                <span className="font-medium text-gray-800">
                  Billing Period:
                </span>{" "}
                {invoice.billing_period}
              </p>
              <p>
                <span className="font-medium text-gray-800">Status:</span>{" "}
                {invoice.invoice_status}
              </p>
              <p>
                <span className="font-medium text-gray-800">Total Value:</span>{" "}
                {invoice.invoice_total_value}
              </p>
              <p>
                <span className="font-medium text-gray-800">Currency:</span>{" "}
                {invoice.invoice_currency}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
