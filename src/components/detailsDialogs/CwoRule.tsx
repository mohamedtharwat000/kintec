import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { CWO_Rule, CalloffWorkOrder } from "@/types/Orders";

// Update the interface to reflect the actual data structure
interface CwoRuleDetailsProps {
  cwoRule: CWO_Rule & { calloff_work_order?: CalloffWorkOrder };
  open: boolean;
  onClose: () => void;
}

export function CwoRuleDetails({
  cwoRule,
  open,
  onClose,
}: CwoRuleDetailsProps) {
  return (
    <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl flex items-center gap-2">
            Call-off Work Order Rule Details
          </DialogTitle>
          <DialogDescription>Rule ID: {cwoRule.CWO_rule_id}</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Rule Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">
                Call-off Work Order Rule Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <dt className="font-medium text-muted-foreground mb-1">
                    Rule ID
                  </dt>
                  <dd className="font-mono">{cwoRule.CWO_rule_id}</dd>
                </div>
                <div>
                  <dt className="font-medium text-muted-foreground mb-1">
                    CWO ID
                  </dt>
                  <dd className="font-mono">{cwoRule.CWO_id}</dd>
                </div>
                <div>
                  <dt className="font-medium text-muted-foreground mb-1">
                    Number Format
                  </dt>
                  <dd>{cwoRule.CWO_number_format || "Not specified"}</dd>
                </div>
                <div>
                  <dt className="font-medium text-muted-foreground mb-1">
                    Final Invoice Label
                  </dt>
                  <dd>{cwoRule.final_invoice_label || "Not specified"}</dd>
                </div>
                <div>
                  <dt className="font-medium text-muted-foreground mb-1">
                    Extension Handling
                  </dt>
                  <dd>{cwoRule.CWO_extension_handling || "Not specified"}</dd>
                </div>
                <div>
                  <dt className="font-medium text-muted-foreground mb-1">
                    Mob/Demob Fee Rules
                  </dt>
                  <dd>{cwoRule.mob_demob_fee_rules || "Not specified"}</dd>
                </div>
              </dl>
            </CardContent>
          </Card>

          {/* Related CWO Information */}
          {cwoRule.calloff_work_order && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  Related Call-off Work Order
                </CardTitle>
              </CardHeader>
              <CardContent>
                <dl className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <dt className="font-medium text-muted-foreground mb-1">
                      CWO ID
                    </dt>
                    <dd className="font-mono">
                      {cwoRule.calloff_work_order.CWO_id}
                    </dd>
                  </div>
                  <div>
                    <dt className="font-medium text-muted-foreground mb-1">
                      Status
                    </dt>
                    <dd>{cwoRule.calloff_work_order.CWO_status}</dd>
                  </div>
                  <div>
                    <dt className="font-medium text-muted-foreground mb-1">
                      Start Date
                    </dt>
                    <dd>
                      {new Date(
                        cwoRule.calloff_work_order.CWO_start_date
                      ).toLocaleDateString()}
                    </dd>
                  </div>
                  <div>
                    <dt className="font-medium text-muted-foreground mb-1">
                      End Date
                    </dt>
                    <dd>
                      {new Date(
                        cwoRule.calloff_work_order.CWO_end_date
                      ).toLocaleDateString()}
                    </dd>
                  </div>
                  <div>
                    <dt className="font-medium text-muted-foreground mb-1">
                      Total Value
                    </dt>
                    <dd>
                      {Number(
                        cwoRule.calloff_work_order.CWO_total_value
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
                        href={`mailto:${cwoRule.calloff_work_order.kintec_email_for_remittance}`}
                        className="text-blue-600 hover:underline"
                      >
                        {cwoRule.calloff_work_order.kintec_email_for_remittance}
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
