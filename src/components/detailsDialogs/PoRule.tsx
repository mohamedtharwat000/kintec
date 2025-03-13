import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { RPO_Rule, PurchaseOrder } from "@/types/Orders";

// Update the interface to reflect the actual data structure
interface PoRuleDetailsProps {
  poRule: RPO_Rule & { purchase_order?: PurchaseOrder };
  open: boolean;
  onClose: () => void;
}

export function PoRuleDetails({ poRule, open, onClose }: PoRuleDetailsProps) {
  return (
    <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl flex items-center gap-2">
            Purchase Order Rule Details
          </DialogTitle>
          <DialogDescription>Rule ID: {poRule.RPO_rule_id}</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Rule Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">
                Purchase Order Rule Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <dt className="font-medium text-muted-foreground mb-1">
                    Rule ID
                  </dt>
                  <dd className="font-mono">{poRule.RPO_rule_id}</dd>
                </div>
                <div>
                  <dt className="font-medium text-muted-foreground mb-1">
                    PO ID
                  </dt>
                  <dd className="font-mono">{poRule.PO_id}</dd>
                </div>
                <div>
                  <dt className="font-medium text-muted-foreground mb-1">
                    Number Format
                  </dt>
                  <dd>{poRule.RPO_number_format || "Not specified"}</dd>
                </div>
                <div>
                  <dt className="font-medium text-muted-foreground mb-1">
                    Final Invoice Label
                  </dt>
                  <dd>{poRule.final_invoice_label || "Not specified"}</dd>
                </div>
                <div>
                  <dt className="font-medium text-muted-foreground mb-1">
                    Extension Handling
                  </dt>
                  <dd>{poRule.RPO_extension_handling || "Not specified"}</dd>
                </div>
                <div>
                  <dt className="font-medium text-muted-foreground mb-1">
                    Mob/Demob Fee Rules
                  </dt>
                  <dd>{poRule.mob_demob_fee_rules || "Not specified"}</dd>
                </div>
              </dl>
            </CardContent>
          </Card>

          {/* Related PO Information */}
          {poRule.purchase_order && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  Related Purchase Order
                </CardTitle>
              </CardHeader>
              <CardContent>
                <dl className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <dt className="font-medium text-muted-foreground mb-1">
                      PO ID
                    </dt>
                    <dd className="font-mono">{poRule.purchase_order.PO_id}</dd>
                  </div>
                  <div>
                    <dt className="font-medium text-muted-foreground mb-1">
                      Status
                    </dt>
                    <dd>{poRule.purchase_order.PO_status}</dd>
                  </div>
                  <div>
                    <dt className="font-medium text-muted-foreground mb-1">
                      Start Date
                    </dt>
                    <dd>
                      {new Date(
                        poRule.purchase_order.PO_start_date
                      ).toLocaleDateString()}
                    </dd>
                  </div>
                  <div>
                    <dt className="font-medium text-muted-foreground mb-1">
                      End Date
                    </dt>
                    <dd>
                      {new Date(
                        poRule.purchase_order.PO_end_date
                      ).toLocaleDateString()}
                    </dd>
                  </div>
                  <div>
                    <dt className="font-medium text-muted-foreground mb-1">
                      Total Value
                    </dt>
                    <dd>
                      {Number(
                        poRule.purchase_order.PO_total_value
                      ).toLocaleString("en-US", {
                        style: "currency",
                        currency: "USD",
                      })}
                    </dd>
                  </div>
                  <div>
                    <dt className="font-medium text-muted-foreground mb-1">
                      Remittance Email
                    </dt>
                    <dd>
                      <a
                        href={`mailto:${poRule.purchase_order.kintec_email_for_remittance}`}
                        className="text-blue-600 hover:underline"
                      >
                        {poRule.purchase_order.kintec_email_for_remittance}
                      </a>
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
