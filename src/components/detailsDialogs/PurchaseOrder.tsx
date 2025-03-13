import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PurchaseOrder } from "@/types/Orders";

interface PurchaseOrderDetailsProps {
  purchaseOrder: PurchaseOrder;
  open: boolean;
  onClose: () => void;
}

export function PurchaseOrderDetails({
  purchaseOrder,
  open,
  onClose,
}: PurchaseOrderDetailsProps) {
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(value);
  };

  const StatusBadge = ({ status }: { status: string }) => {
    const colorMap: Record<string, string> = {
      active: "bg-green-500",
      expired: "bg-gray-500",
      cancelled: "bg-red-500",
    };

    return (
      <Badge
        className={`${colorMap[status] || "bg-blue-500"} hover:${
          colorMap[status] || "bg-blue-500"
        }`}
      >
        {status}
      </Badge>
    );
  };

  return (
    <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl flex items-center gap-2">
            Purchase Order Details
          </DialogTitle>
          <DialogDescription>PO ID: {purchaseOrder.PO_id}</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* PO Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">
                Purchase Order Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <dt className="font-medium text-muted-foreground mb-1">
                    PO ID
                  </dt>
                  <dd className="font-mono">{purchaseOrder.PO_id}</dd>
                </div>
                <div>
                  <dt className="font-medium text-muted-foreground mb-1">
                    Status
                  </dt>
                  <dd>
                    <StatusBadge status={purchaseOrder.PO_status} />
                  </dd>
                </div>
                <div>
                  <dt className="font-medium text-muted-foreground mb-1">
                    Start Date
                  </dt>
                  <dd>{formatDate(purchaseOrder.PO_start_date)}</dd>
                </div>
                <div>
                  <dt className="font-medium text-muted-foreground mb-1">
                    End Date
                  </dt>
                  <dd>{formatDate(purchaseOrder.PO_end_date)}</dd>
                </div>
                <div>
                  <dt className="font-medium text-muted-foreground mb-1">
                    Total Value
                  </dt>
                  <dd className="font-medium">
                    {formatCurrency(purchaseOrder.PO_total_value)}
                  </dd>
                </div>
                <div>
                  <dt className="font-medium text-muted-foreground mb-1">
                    Remittance Email
                  </dt>
                  <dd>
                    <a
                      href={`mailto:${purchaseOrder.kintec_email_for_remittance}`}
                      className="text-blue-600 hover:underline"
                    >
                      {purchaseOrder.kintec_email_for_remittance}
                    </a>
                  </dd>
                </div>
              </dl>
            </CardContent>
          </Card>

          {/* Contract Information */}
          {purchaseOrder.contract && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Related Contract</CardTitle>
              </CardHeader>
              <CardContent>
                <dl className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <dt className="font-medium text-muted-foreground mb-1">
                      Contract ID
                    </dt>
                    <dd className="font-mono">
                      {purchaseOrder.contract.contract_id}
                    </dd>
                  </div>
                  <div>
                    <dt className="font-medium text-muted-foreground mb-1">
                      Job Title
                    </dt>
                    <dd>{purchaseOrder.contract.job_title}</dd>
                  </div>
                  <div>
                    <dt className="font-medium text-muted-foreground mb-1">
                      Job Number
                    </dt>
                    <dd>{purchaseOrder.contract.job_number}</dd>
                  </div>
                  <div>
                    <dt className="font-medium text-muted-foreground mb-1">
                      Contract Status
                    </dt>
                    <dd>
                      <StatusBadge
                        status={purchaseOrder.contract.contract_status}
                      />
                    </dd>
                  </div>
                  <div>
                    <dt className="font-medium text-muted-foreground mb-1">
                      Contract Start
                    </dt>
                    <dd>
                      {formatDate(purchaseOrder.contract.contract_start_date)}
                    </dd>
                  </div>
                  <div>
                    <dt className="font-medium text-muted-foreground mb-1">
                      Contract End
                    </dt>
                    <dd>
                      {formatDate(purchaseOrder.contract.contract_end_date)}
                    </dd>
                  </div>
                </dl>
              </CardContent>
            </Card>
          )}

          {/* Rates Information */}
          {purchaseOrder.rates && purchaseOrder.rates.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Rate Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 text-sm">
                    <thead>
                      <tr>
                        <th className="px-4 py-2 text-left font-medium text-gray-500">
                          Type
                        </th>
                        <th className="px-4 py-2 text-left font-medium text-gray-500">
                          Frequency
                        </th>
                        <th className="px-4 py-2 text-left font-medium text-gray-500">
                          Value
                        </th>
                        <th className="px-4 py-2 text-left font-medium text-gray-500">
                          Currency
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {purchaseOrder.rates.map((rate) => (
                        <tr key={rate.rate_id}>
                          <td className="px-4 py-2 capitalize">
                            {rate.rate_type}
                          </td>
                          <td className="px-4 py-2 capitalize">
                            {rate.rate_frequency}
                          </td>
                          <td className="px-4 py-2">
                            {rate.rate_value.toString()}
                          </td>
                          <td className="px-4 py-2">{rate.rate_currency}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Rules Information */}
          {purchaseOrder.RPO_rules && purchaseOrder.RPO_rules.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Purchase Order Rules</CardTitle>
              </CardHeader>
              <CardContent>
                <dl className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <dt className="font-medium text-muted-foreground mb-1">
                      Number Format
                    </dt>
                    <dd>
                      {purchaseOrder.RPO_rules[0].RPO_number_format || "N/A"}
                    </dd>
                  </div>
                  <div>
                    <dt className="font-medium text-muted-foreground mb-1">
                      Final Invoice Label
                    </dt>
                    <dd>
                      {purchaseOrder.RPO_rules[0].final_invoice_label || "N/A"}
                    </dd>
                  </div>
                  <div>
                    <dt className="font-medium text-muted-foreground mb-1">
                      Extension Handling
                    </dt>
                    <dd>
                      {purchaseOrder.RPO_rules[0].RPO_extension_handling ||
                        "N/A"}
                    </dd>
                  </div>
                  <div>
                    <dt className="font-medium text-muted-foreground mb-1">
                      Mob/Demob Fee Rules
                    </dt>
                    <dd>
                      {purchaseOrder.RPO_rules[0].mob_demob_fee_rules || "N/A"}
                    </dd>
                  </div>
                </dl>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
