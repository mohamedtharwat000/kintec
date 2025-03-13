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
import { Info } from "lucide-react";
import { ExpenseValidationRule } from "@/types/Expense";

interface ExpenseValidationRuleDetailsProps {
  rule: ExpenseValidationRule;
}

export function ExpenseValidationRuleDetails({
  rule,
}: ExpenseValidationRuleDetailsProps) {
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
            Expense Validation Rule Details
          </DialogTitle>
          <DialogDescription>ID: {rule.exp_val_rule_id}</DialogDescription>
        </DialogHeader>

        {/* Rule Info Card */}
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
                <dd className="font-mono">{rule.exp_val_rule_id}</dd>
              </div>
              <div>
                <dt className="font-medium text-muted-foreground mb-1">
                  Expense ID
                </dt>
                <dd className="font-mono">{rule.expense_id}</dd>
              </div>
            </dl>
          </CardContent>
        </Card>

        {/* Validation Rules Card */}
        <Card className="mt-4">
          <CardHeader>
            <CardTitle className="text-lg">Validation Rules</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <dt className="font-medium text-muted-foreground mb-1">
                  Allowable Expense Types
                </dt>
                <dd>{rule.allowable_expense_types || "Not specified"}</dd>
              </div>
              <div>
                <dt className="font-medium text-muted-foreground mb-1">
                  Expense Documentation
                </dt>
                <dd>{rule.expense_documentation || "Not specified"}</dd>
              </div>
              <div>
                <dt className="font-medium text-muted-foreground mb-1">
                  Supporting Documentation Type
                </dt>
                <dd>{rule.supporting_documentation_type || "Not specified"}</dd>
              </div>
              <div>
                <dt className="font-medium text-muted-foreground mb-1">
                  Expense Limit
                </dt>
                <dd>{rule.expense_limit || "Not specified"}</dd>
              </div>
            </dl>
          </CardContent>
        </Card>

        {/* Reimbursement Rule Card */}
        {rule.reimbursement_rule && (
          <Card className="mt-4">
            <CardHeader>
              <CardTitle className="text-lg">Reimbursement Rules</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm whitespace-pre-line">
                {rule.reimbursement_rule}
              </p>
            </CardContent>
          </Card>
        )}
      </DialogContent>
    </Dialog>
  );
}
