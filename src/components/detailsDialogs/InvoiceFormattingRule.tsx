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
import { FileText, Info, Check, X } from "lucide-react";
import { InvoiceFormattingRule } from "@/types/Invoice";
import { useInvoice } from "@/hooks/useInvoices";

interface InvoiceFormattingRuleDetailsProps {
  rule: InvoiceFormattingRule;
}

export function InvoiceFormattingRuleDetails({
  rule,
}: InvoiceFormattingRuleDetailsProps) {
  const { data: invoice, isLoading } = useInvoice(rule.invoice_id);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon">
          <Info className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[85vw] max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <FileText className="h-5 w-5" />
            Invoice Formatting Rule Details
          </DialogTitle>
          <DialogDescription className="hidden" />
        </DialogHeader>

        {/* Rule Details Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Rule Information</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <dt className="font-medium text-muted-foreground mb-1">
                  Rule ID
                </dt>
                <dd className="font-mono">{rule.inv_formatting_rule_id}</dd>
              </div>
              <div>
                <dt className="font-medium text-muted-foreground mb-1">
                  Invoice ID
                </dt>
                <dd className="font-mono">{rule.invoice_id}</dd>
              </div>
              <div>
                <dt className="font-medium text-muted-foreground mb-1">
                  File Format
                </dt>
                <dd>{rule.file_format || "Not specified"}</dd>
              </div>
            </dl>
          </CardContent>
        </Card>

        {/* Required Fields Card */}
        <Card className="mt-4">
          <CardHeader>
            <CardTitle className="text-lg">Required Invoice Fields</CardTitle>
          </CardHeader>
          <CardContent>
            {rule.required_invoice_fields ? (
              <div className="text-sm whitespace-pre-wrap">
                {rule.required_invoice_fields}
              </div>
            ) : (
              <div className="text-sm text-muted-foreground">
                No required fields specified
              </div>
            )}
          </CardContent>
        </Card>

        {/* Attachment Requirements Card */}
        <Card className="mt-4">
          <CardHeader>
            <CardTitle className="text-lg">Attachment Requirements</CardTitle>
          </CardHeader>
          <CardContent>
            {rule.attachment_requirements ? (
              <div className="text-sm whitespace-pre-wrap">
                {rule.attachment_requirements}
              </div>
            ) : (
              <div className="text-sm text-muted-foreground">
                No attachment requirements specified
              </div>
            )}
          </CardContent>
        </Card>

        {/* Related Invoice Card */}
        {invoice && (
          <Card className="mt-4">
            <CardHeader>
              <CardTitle className="text-lg">Related Invoice</CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <dt className="font-medium text-muted-foreground mb-1">
                    Billing Period
                  </dt>
                  <dd>
                    {new Date(invoice.billing_period).toLocaleDateString(
                      "en-US",
                      {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      }
                    )}
                  </dd>
                </div>
                <div>
                  <dt className="font-medium text-muted-foreground mb-1">
                    Status
                  </dt>
                  <dd>
                    <Badge
                      className={`${
                        invoice.invoice_status === "paid"
                          ? "bg-green-500"
                          : "bg-amber-500"
                      }`}
                    >
                      {invoice.invoice_status}
                    </Badge>
                  </dd>
                </div>
                <div>
                  <dt className="font-medium text-muted-foreground mb-1">
                    Type
                  </dt>
                  <dd className="capitalize">{invoice.invoice_type}</dd>
                </div>
                <div>
                  <dt className="font-medium text-muted-foreground mb-1">
                    Total Value
                  </dt>
                  <dd className="font-mono font-medium">
                    {invoice.invoice_currency}{" "}
                    {parseFloat(invoice.invoice_total_value.toString()).toFixed(
                      2
                    )}
                  </dd>
                </div>
                <div>
                  <dt className="font-medium text-muted-foreground mb-1">
                    WHT Applicable
                  </dt>
                  <dd>
                    {invoice.wht_applicable ? (
                      <div className="flex items-center">
                        <Check className="h-4 w-4 text-green-500 mr-1" />
                        <span>Yes ({invoice.wht_rate}%)</span>
                      </div>
                    ) : (
                      <div className="flex items-center">
                        <X className="h-4 w-4 text-red-500 mr-1" />
                        <span>No</span>
                      </div>
                    )}
                  </dd>
                </div>
                <div>
                  <dt className="font-medium text-muted-foreground mb-1">
                    External Assignment
                  </dt>
                  <dd>
                    {invoice.external_assignment ? (
                      <div className="flex items-center">
                        <Check className="h-4 w-4 text-green-500 mr-1" />
                        <span>Yes</span>
                      </div>
                    ) : (
                      <div className="flex items-center">
                        <X className="h-4 w-4 text-red-500 mr-1" />
                        <span>No</span>
                      </div>
                    )}
                  </dd>
                </div>
                <div>
                  <dt className="font-medium text-muted-foreground mb-1">
                    Related To
                  </dt>
                  <dd>
                    {invoice.purchase_order
                      ? `PO: ${invoice.purchase_order.PO_id}`
                      : invoice.calloff_work_order
                      ? `CWO: ${invoice.calloff_work_order.CWO_id}`
                      : "-"}
                  </dd>
                </div>
              </dl>
            </CardContent>
          </Card>
        )}
      </DialogContent>
    </Dialog>
  );
}
