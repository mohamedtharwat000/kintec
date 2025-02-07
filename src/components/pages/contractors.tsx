import { useEmployees } from "@/hooks/useApp";
import { Loader2 } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export function Employees() {
  const { data, isLoading } = useEmployees();

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
        {data?.map((contractor) => (
          <div
            key={contractor.contractor_id}
            className="card shadow-lg rounded-lg border bg-white"
          >
            <Accordion type="single" collapsible>
              <AccordionItem
                value={contractor.contractor_id}
                className="border-0"
              >
                <AccordionTrigger className="px-4 py-3 hover:no-underline">
                  <div className="flex-1 text-left">
                    <h3 className="text-lg font-semibold text-gray-800">
                      {contractor.first_name} {contractor.middle_name}{" "}
                      {contractor.last_name}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {contractor.email_address}
                    </p>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-4 pb-4">
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                      <div>
                        <p className="text-gray-600">
                          Full Name:{" "}
                          <span className="font-medium text-gray-800">
                            {`${contractor.first_name} ${
                              contractor.middle_name || ""
                            } ${contractor.last_name}`}
                          </span>
                        </p>
                        <p className="text-gray-600">
                          Email:{" "}
                          <span className="font-medium text-gray-800">
                            {contractor.email_address}
                          </span>
                        </p>
                        <p className="text-gray-600">
                          Phone:{" "}
                          <span className="font-medium text-gray-800">
                            {contractor.phone_number}
                          </span>
                        </p>
                        <p className="text-gray-600">
                          Nationality:{" "}
                          <span className="font-medium text-gray-800">
                            {contractor.nationality}
                          </span>
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-600">
                          Date of Birth:{" "}
                          <span className="font-medium text-gray-800">
                            {contractor.date_of_birth}
                          </span>
                        </p>
                        <p className="text-gray-600">
                          Address:{" "}
                          <span className="font-medium text-gray-800">
                            {contractor.address}
                          </span>
                        </p>
                        <p className="text-gray-600">
                          Country of Residence:{" "}
                          <span className="font-medium text-gray-800">
                            {contractor.country_of_residence}
                          </span>
                        </p>
                        <p className="text-gray-600">
                          Contractor ID:{" "}
                          <span className="font-medium text-gray-800">
                            {contractor.contractor_id}
                          </span>
                        </p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h4 className="text-xl font-semibold text-gray-800 border-b pb-2">
                        Bank Details
                      </h4>
                      <div className="grid grid-cols-1 gap-4">
                        {contractor.bank_details.map((bank) => (
                          <div
                            key={bank.bank_detail_id}
                            className="p-4 bg-gray-50 rounded-lg"
                          >
                            <p className="text-gray-600">
                              Bank Detail ID:{" "}
                              <span className="font-medium text-gray-800">
                                {bank.bank_detail_id}
                              </span>
                            </p>
                            <p className="text-gray-600">
                              Bank Name:{" "}
                              <span className="font-medium text-gray-800">
                                {bank.bank_name}
                              </span>
                            </p>
                            <p className="text-gray-600">
                              Account Number:{" "}
                              <span className="font-medium text-gray-800">
                                {bank.account_number}
                              </span>
                            </p>
                            <p className="text-gray-600">
                              IBAN:{" "}
                              <span className="font-medium text-gray-800">
                                {bank.IBAN}
                              </span>
                            </p>
                            <p className="text-gray-600">
                              SWIFT:{" "}
                              <span className="font-medium text-gray-800">
                                {bank.SWIFT}
                              </span>
                            </p>
                            <p className="text-gray-600">
                              Currency:{" "}
                              <span className="font-medium text-gray-800">
                                {bank.currency}
                              </span>
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h4 className="text-xl font-semibold text-gray-800 border-b pb-2">
                        Visa Details
                      </h4>
                      <div className="grid grid-cols-1 gap-4">
                        {contractor.visa_details.map((visa) => (
                          <div
                            key={visa.visa_detail_id}
                            className="p-4 bg-gray-50 rounded-lg"
                          >
                            <p className="text-gray-600">
                              Visa Detail ID:{" "}
                              <span className="font-medium text-gray-800">
                                {visa.visa_detail_id}
                              </span>
                            </p>
                            <p className="text-gray-600">
                              Visa Number:{" "}
                              <span className="font-medium text-gray-800">
                                {visa.visa_number}
                              </span>
                            </p>
                            <p className="text-gray-600">
                              Type:{" "}
                              <span className="font-medium text-gray-800">
                                {visa.visa_type}
                              </span>
                            </p>
                            <p className="text-gray-600">
                              Country:{" "}
                              <span className="font-medium text-gray-800">
                                {visa.visa_country}
                              </span>
                            </p>
                            <p className="text-gray-600">
                              Expiry Date:{" "}
                              <span className="font-medium text-gray-800">
                                {visa.visa_expiry_date}
                              </span>
                            </p>
                            <p className="text-gray-600">
                              Status:{" "}
                              <span className="font-medium text-gray-800">
                                {visa.visa_status}
                              </span>
                            </p>
                            <p className="text-gray-600">
                              Sponsor:{" "}
                              <span className="font-medium text-gray-800">
                                {visa.visa_sponsor}
                              </span>
                            </p>
                            <p className="text-gray-600">
                              Country ID:{" "}
                              <span className="font-medium text-gray-800">
                                {visa.country_id_number} ({visa.country_id_type}
                                )
                              </span>
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h4 className="text-xl font-semibold text-gray-800 border-b pb-2">
                        Contracts
                      </h4>
                      {contractor.contracts.map((contract) => (
                        <div
                          key={contract.contract_id}
                          className="p-4 bg-gray-50 rounded-lg space-y-4"
                        >
                          <div className="space-y-2">
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
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <p className="text-gray-600">
                              Job Title:{" "}
                              <span className="font-medium text-gray-800">
                                {contract.job_title}
                              </span>
                            </p>
                            <p className="text-gray-600">
                              Type:{" "}
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
                                  className="p-4 bg-white rounded-lg border mb-2"
                                >
                                  <div className="grid grid-cols-2 gap-4">
                                    <p className="text-gray-600">
                                      Contract ID:{" "}
                                      <span className="font-medium text-gray-800">
                                        {po.contract_id}
                                      </span>
                                    </p>
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
                                      Value:{" "}
                                      <span className="font-medium text-gray-800">
                                        {po.PO_total_value}{" "}
                                        {po.invoice?.invoice_currency}
                                      </span>
                                    </p>
                                    <p className="text-gray-600">
                                      Period:{" "}
                                      <span className="font-medium text-gray-800">
                                        {po.PO_start_date} to {po.PO_end_date}
                                      </span>
                                    </p>
                                  </div>
                                  <p className="text-gray-600">
                                    Remittance Email:{" "}
                                    <span className="font-medium text-gray-800">
                                      {po.kintec_email_for_remittance}
                                    </span>
                                  </p>

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
                                          Value:{" "}
                                          <span className="font-medium text-gray-800">
                                            {po.invoice.invoice_total_value}{" "}
                                            {po.invoice.invoice_currency}
                                          </span>
                                        </p>
                                        <p className="text-gray-600">
                                          Period:{" "}
                                          <span className="font-medium text-gray-800">
                                            {po.invoice.billing_period}
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
