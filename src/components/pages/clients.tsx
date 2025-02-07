import { useClients } from "@/hooks/useApp";
import { Loader2 } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export function Clients() {
  const { data, isLoading } = useClients();

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  return (
    <div className="h-full p-4 overflow-auto">
      <div className="grid grid-cols-1 gap-4">
        {data?.map((client) => (
          <div
            key={client.client_company_id}
            className="card shadow-lg rounded-lg border bg-white"
          >
            <Accordion type="single" collapsible>
              <AccordionItem
                value={client.client_company_id}
                className="border-0"
              >
                <AccordionTrigger className="px-4 py-3 hover:no-underline">
                  <div className="flex-1 text-left">
                    <h3 className="text-lg font-semibold text-gray-800">
                      {client.client_company_name}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {client.contact_email}
                    </p>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-4 pb-4">
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                      <p className="text-gray-600">
                        Company ID:{" "}
                        <span className="font-medium text-gray-800">
                          {client.client_company_id}
                        </span>
                      </p>
                      <p className="text-gray-600">
                        Company Name:{" "}
                        <span className="font-medium text-gray-800">
                          {client.client_company_name}
                        </span>
                      </p>
                      <p className="text-gray-600">
                        Contact Email:{" "}
                        <span className="font-medium text-gray-800">
                          {client.contact_email}
                        </span>
                      </p>
                    </div>

                    <div className="space-y-4">
                      <h4 className="text-xl font-semibold text-gray-800 border-b pb-2">
                        Contracts
                      </h4>
                      {client.contracts.map((contract) => (
                        <div
                          key={contract.contract_id}
                          className="p-4 bg-gray-50 rounded-lg space-y-4"
                        >
                          <div className="grid grid-cols-2 gap-4">
                            <p className="text-gray-600">
                              Contract ID:{" "}
                              <span className="font-medium text-gray-800">
                                {contract.contract_id}
                              </span>
                            </p>
                            <p className="text-gray-600">
                              Contractor ID:{" "}
                              <span className="font-medium text-gray-800">
                                {contract.contractor_id}
                              </span>
                            </p>
                            <p className="text-gray-600">
                              Client Company ID:{" "}
                              <span className="font-medium text-gray-800">
                                {contract.client_company_id}
                              </span>
                            </p>
                            <p className="text-gray-600">
                              Job Title:{" "}
                              <span className="font-medium text-gray-800">
                                {contract.job_title}
                              </span>
                            </p>
                            <p className="text-gray-600">
                              Job Type:{" "}
                              <span className="font-medium text-gray-800">
                                {contract.job_type}
                              </span>
                            </p>
                            <p className="text-gray-600">
                              Status:{" "}
                              <span className="font-medium text-gray-800">
                                {contract.contract_status}
                              </span>
                            </p>
                            <p className="text-gray-600">
                              Duration:{" "}
                              <span className="font-medium text-gray-800">
                                {contract.contract_start_date} to{" "}
                                {contract.contract_end_date}
                              </span>
                            </p>
                          </div>

                          {contract.purchase_orders.length > 0 && (
                            <div className="mt-4">
                              <h5 className="font-semibold text-gray-800 mb-2">
                                Purchase Orders
                              </h5>
                              {contract.purchase_orders.map((po) => (
                                <div
                                  key={po.PO_id}
                                  className="p-3 bg-white rounded border mb-2"
                                >
                                  <div className="grid grid-cols-2 gap-2">
                                    <p className="text-gray-600">
                                      PO ID:{" "}
                                      <span className="font-medium text-gray-800">
                                        {po.PO_id}
                                      </span>
                                    </p>
                                    <p className="text-gray-600">
                                      Status:{" "}
                                      <span className="font-medium text-gray-800">
                                        {po.PO_status}
                                      </span>
                                    </p>
                                    <p className="text-gray-600">
                                      Total Value:{" "}
                                      <span className="font-medium text-gray-800">
                                        {po.PO_total_value}
                                      </span>
                                    </p>
                                    <p className="text-gray-600">
                                      Remittance Email:{" "}
                                      <span className="font-medium text-gray-800">
                                        {po.kintec_email_for_remittance}
                                      </span>
                                    </p>
                                    <p className="text-gray-600">
                                      Period:{" "}
                                      <span className="font-medium text-gray-800">
                                        {po.PO_start_date} to {po.PO_end_date}
                                      </span>
                                    </p>
                                  </div>

                                  {po.invoice && (
                                    <div className="mt-2 pt-2 border-t">
                                      <p className="text-sm font-medium text-gray-700">
                                        Invoice Details:
                                      </p>
                                      <div className="grid grid-cols-2 gap-2 mt-1">
                                        <p className="text-gray-600">
                                          Invoice ID:{" "}
                                          <span className="font-medium text-gray-800">
                                            {po.invoice.invoice_id}
                                          </span>
                                        </p>
                                        <p className="text-gray-600">
                                          Status:{" "}
                                          <span className="font-medium text-gray-800">
                                            {po.invoice.invoice_status}
                                          </span>
                                        </p>
                                        <p className="text-gray-600">
                                          Billing Period:{" "}
                                          <span className="font-medium text-gray-800">
                                            {po.invoice.billing_period}
                                          </span>
                                        </p>
                                        <p className="text-gray-600">
                                          Total Value:{" "}
                                          <span className="font-medium text-gray-800">
                                            {po.invoice.invoice_total_value}{" "}
                                            {po.invoice.invoice_currency}
                                          </span>
                                        </p>
                                      </div>
                                    </div>
                                  )}

                                  {po.rate && (
                                    <div className="mt-2 pt-2 border-t">
                                      <p className="text-sm font-medium text-gray-700">
                                        Rate Details:
                                      </p>
                                      <div className="grid grid-cols-2 gap-2 mt-1">
                                        <p className="text-gray-600">
                                          Rate ID:{" "}
                                          <span className="font-medium text-gray-800">
                                            {po.rate.rate_id}
                                          </span>
                                        </p>
                                        <p className="text-gray-600">
                                          Type:{" "}
                                          <span className="font-medium text-gray-800">
                                            {po.rate.rate_type}
                                          </span>
                                        </p>
                                        <p className="text-gray-600">
                                          Frequency:{" "}
                                          <span className="font-medium text-gray-800">
                                            {po.rate.rate_frequency}
                                          </span>
                                        </p>
                                        <p className="text-gray-600">
                                          Value:{" "}
                                          <span className="font-medium text-gray-800">
                                            {po.rate.rate_value}{" "}
                                            {po.rate.rate_currency}
                                          </span>
                                        </p>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        ))}
      </div>
    </div>
  );
}
