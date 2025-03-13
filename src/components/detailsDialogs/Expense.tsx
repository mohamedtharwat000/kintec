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
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Info } from "lucide-react";
import { Expense, ExpenseType } from "@/types/Expense";

interface ExpenseDetailsProps {
  expense: Expense;
}

export function ExpenseDetails({ expense }: ExpenseDetailsProps) {
  const formatCurrency = (value: number, currency: string) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency || "USD",
      minimumFractionDigits: 2,
    }).format(value);
  };

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
            Expense Details
          </DialogTitle>
          <DialogDescription>ID: {expense.expense_id}</DialogDescription>
        </DialogHeader>

        {/* Main Expense Info Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Expense Information</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <dt className="font-medium text-muted-foreground mb-1">Type</dt>
                <dd>
                  <Badge
                    className={
                      expense.expense_type === ExpenseType.charged
                        ? "bg-blue-500"
                        : "bg-green-500"
                    }
                  >
                    {expense.expense_type}
                  </Badge>
                </dd>
              </div>
              <div>
                <dt className="font-medium text-muted-foreground mb-1">
                  Frequency
                </dt>
                <dd>{expense.expense_frequency}</dd>
              </div>
              <div>
                <dt className="font-medium text-muted-foreground mb-1">
                  Amount
                </dt>
                <dd className="font-medium">
                  {formatCurrency(
                    expense.expense_value,
                    expense.expsense_currency
                  )}
                </dd>
              </div>
              <div>
                <dt className="font-medium text-muted-foreground mb-1">
                  Currency
                </dt>
                <dd>{expense.expsense_currency}</dd>
              </div>
              <div>
                <dt className="font-medium text-muted-foreground mb-1">
                  Pro Rata %
                </dt>
                <dd>{expense.pro_rata_percentage}%</dd>
              </div>
            </dl>
          </CardContent>
        </Card>

        {/* Order Reference Card */}
        <Card className="mt-4">
          <CardHeader>
            <CardTitle className="text-lg">Order Reference</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <dt className="font-medium text-muted-foreground mb-1">
                  PO ID
                </dt>
                <dd>{expense.PO_id || "Not assigned"}</dd>
              </div>
              <div>
                <dt className="font-medium text-muted-foreground mb-1">
                  CWO ID
                </dt>
                <dd>{expense.CWO_id || "Not assigned"}</dd>
              </div>
            </dl>
          </CardContent>
        </Card>

        {/* Validation Rules Card */}
        {expense.validation_rules && expense.validation_rules.length > 0 && (
          <Card className="mt-4">
            <CardHeader>
              <CardTitle className="text-lg">Validation Rules</CardTitle>
              <CardDescription>
                There are {expense.validation_rules.length} rules associated
                with this expense
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Rule ID</TableHead>
                      <TableHead>Allowable Types</TableHead>
                      <TableHead>Documentation</TableHead>
                      <TableHead>Support Doc Type</TableHead>
                      <TableHead>Limit</TableHead>
                      <TableHead>Reimbursement Rule</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {expense.validation_rules.map((rule) => (
                      <TableRow key={rule.exp_val_rule_id}>
                        <TableCell className="font-mono">
                          {rule.exp_val_rule_id.substring(0, 8)}...
                        </TableCell>
                        <TableCell>
                          {rule.allowable_expense_types || "-"}
                        </TableCell>
                        <TableCell>
                          {rule.expense_documentation || "-"}
                        </TableCell>
                        <TableCell>
                          {rule.supporting_documentation_type || "-"}
                        </TableCell>
                        <TableCell>{rule.expense_limit || "-"}</TableCell>
                        <TableCell>{rule.reimbursement_rule || "-"}</TableCell>
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
