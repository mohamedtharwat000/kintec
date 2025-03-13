import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText } from "lucide-react";
import { Invoice } from "@/types/Invoice";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface InvoiceDetailsProps {
  invoice: Invoice;
}

const formatDate = (date: Date) => {
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const formatCurrency = (amount: number, currency: string) => {
  return `${currency} ${parseFloat(amount.toString()).toFixed(2)}`;
};

export function InvoiceDetails({ invoice }: InvoiceDetailsProps) {
  const statusColorMap: Record<string, string> = {
    pending: "bg-amber-500",
    paid: "bg-green-500",
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon">
          <FileText className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[85vw] max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <FileText className="h-5 w-5" />
            Invoice Details
          </DialogTitle>
          <DialogDescription className="hidden" />
        </DialogHeader>

        {/* Invoice Details Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex justify-between items-center">
              <span>Invoice Information</span>
              <Badge
                className={`${
                  statusColorMap[invoice.invoice_status] || "bg-blue-500"
                } hover:${
                  statusColorMap[invoice.invoice_status] || "bg-blue-500"
                }`}
              >
                {invoice.invoice_status}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <dt className="font-medium text-muted-foreground mb-1">
                  Invoice ID
                </dt>
                <dd className="font-mono">{invoice.invoice_id}</dd>
              </div>
              <div>
                <dt className="font-medium text-muted-foreground mb-1">
                  Billing Period
                </dt>
                <dd>{formatDate(invoice.billing_period)}</dd>
              </div>
              <div>
                <dt className="font-medium text-muted-foreground mb-1">Type</dt>
                <dd className="capitalize">{invoice.invoice_type}</dd>
              </div>
              <div>
                <dt className="font-medium text-muted-foreground mb-1">
                  Total Value
                </dt>
                <dd className="font-mono font-medium">
                  {formatCurrency(
                    invoice.invoice_total_value,
                    invoice.invoice_currency
                  )}
                </dd>
              </div>
              <div>
                <dt className="font-medium text-muted-foreground mb-1">
                  External Assignment
                </dt>
                <dd>
                  {invoice.external_assignment ? (
                    <Badge variant="outline" className="bg-blue-50">
                      Yes
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="bg-gray-50">
                      No
                    </Badge>
                  )}
                </dd>
              </div>
              <div>
                <dt className="font-medium text-muted-foreground mb-1">
                  Withholding Tax
                </dt>
                <dd>
                  {invoice.wht_applicable ? (
                    <Badge variant="outline" className="bg-blue-50">
                      {invoice.wht_rate}%
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="bg-gray-50">
                      Not Applicable
                    </Badge>
                  )}
                </dd>
              </div>
            </dl>
          </CardContent>
        </Card>

        {/* Related Purchase Order or CWO */}
        {(invoice.purchase_order || invoice.calloff_work_order) && (
          <Card className="mt-4">
            <CardHeader>
              <CardTitle className="text-lg">
                {invoice.purchase_order
                  ? "Related Purchase Order"
                  : "Related Call-off Work Order"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {invoice.purchase_order && (
                <dl className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <dt className="font-medium text-muted-foreground mb-1">
                      PO ID
                    </dt>
                    <dd>{invoice.purchase_order.PO_id}</dd>
                  </div>
                  <div>
                    <dt className="font-medium text-muted-foreground mb-1">
                      Status
                    </dt>
                    <dd>{invoice.purchase_order.PO_status}</dd>
                  </div>
                  <div>
                    <dt className="font-medium text-muted-foreground mb-1">
                      Total Value
                    </dt>
                    <dd>
                      {parseFloat(
                        invoice.purchase_order.PO_total_value.toString()
                      ).toFixed(2)}
                    </dd>
                  </div>
                  <div>
                    <dt className="font-medium text-muted-foreground mb-1">
                      Start Date
                    </dt>
                    <dd>{formatDate(invoice.purchase_order.PO_start_date)}</dd>
                  </div>
                  <div>
                    <dt className="font-medium text-muted-foreground mb-1">
                      End Date
                    </dt>
                    <dd>{formatDate(invoice.purchase_order.PO_end_date)}</dd>
                  </div>
                </dl>
              )}

              {invoice.calloff_work_order && (
                <dl className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <dt className="font-medium text-muted-foreground mb-1">
                      CWO ID
                    </dt>
                    <dd>{invoice.calloff_work_order.CWO_id}</dd>
                  </div>
                  <div>
                    <dt className="font-medium text-muted-foreground mb-1">
                      Status
                    </dt>
                    <dd>{invoice.calloff_work_order.CWO_status}</dd>
                  </div>
                  <div>
                    <dt className="font-medium text-muted-foreground mb-1">
                      Total Value
                    </dt>
                    <dd>
                      {parseFloat(
                        invoice.calloff_work_order.CWO_total_value.toString()
                      ).toFixed(2)}
                    </dd>
                  </div>
                  <div>
                    <dt className="font-medium text-muted-foreground mb-1">
                      Start Date
                    </dt>
                    <dd>
                      {formatDate(invoice.calloff_work_order.CWO_start_date)}
                    </dd>
                  </div>
                  <div>
                    <dt className="font-medium text-muted-foreground mb-1">
                      End Date
                    </dt>
                    <dd>
                      {formatDate(invoice.calloff_work_order.CWO_end_date)}
                    </dd>
                  </div>
                </dl>
              )}
            </CardContent>
          </Card>
        )}

        {/* Invoice Formatting Rules */}
        {invoice.formatting_rules && invoice.formatting_rules.length > 0 && (
          <Card className="mt-4">
            <CardHeader>
              <CardTitle className="text-lg">Formatting Rules</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Rule ID</TableHead>
                      <TableHead>File Format</TableHead>
                      <TableHead>Required Fields</TableHead>
                      <TableHead>Attachment Requirements</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {invoice.formatting_rules.map((rule) => (
                      <TableRow key={rule.inv_formatting_rule_id}>
                        <TableCell className="font-mono text-xs">
                          {rule.inv_formatting_rule_id}
                        </TableCell>
                        <TableCell>{rule.file_format || "N/A"}</TableCell>
                        <TableCell>
                          {rule.required_invoice_fields || "N/A"}
                        </TableCell>
                        <TableCell>
                          {rule.attachment_requirements || "N/A"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        )}
      </DialogContent>
    </Dialog>
  );
}
