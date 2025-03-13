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
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { DollarSign, Info } from "lucide-react";
import { Rate, RateType } from "@/types/Rate";

interface RateDetailsProps {
  rate: Rate;
}

export function RateDetails({ rate }: RateDetailsProps) {
  // Format currency with value
  const formatCurrency = (value: number, currency: string) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency,
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
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <DollarSign className="h-5 w-5" />
            Rate Details
          </DialogTitle>
          <DialogDescription className="text-sm">
            {rate.rate_type === RateType.charged
              ? "Rate charged to the client"
              : "Rate paid to the contractor"}
          </DialogDescription>
        </DialogHeader>

        {/* Rate Information Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Rate Information</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <dt className="font-medium text-muted-foreground mb-1">ID</dt>
                <dd className="overflow-auto text-xs font-mono">
                  {rate.rate_id}
                </dd>
              </div>
              <div>
                <dt className="font-medium text-muted-foreground mb-1">Type</dt>
                <dd>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Badge
                          className={
                            rate.rate_type === RateType.charged
                              ? "bg-blue-500"
                              : "bg-green-500"
                          }
                        >
                          {rate.rate_type}
                        </Badge>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>
                          {rate.rate_type === RateType.charged
                            ? "Rate charged to the client"
                            : "Rate paid to the contractor"}
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </dd>
              </div>
              <div>
                <dt className="font-medium text-muted-foreground mb-1">
                  Frequency
                </dt>
                <dd className="capitalize">{rate.rate_frequency}</dd>
              </div>
              <div>
                <dt className="font-medium text-muted-foreground mb-1">
                  Value
                </dt>
                <dd className="font-semibold">
                  {formatCurrency(rate.rate_value, rate.rate_currency)}
                </dd>
              </div>
            </dl>
          </CardContent>
        </Card>

        {/* Related Entities */}
        <div className="mt-4">
          {/* Purchase Order Reference (if applicable) */}
          {rate.purchase_order && (
            <Card className="mb-4">
              <CardHeader className="py-3">
                <CardTitle className="text-sm">
                  Purchase Order Reference
                </CardTitle>
              </CardHeader>
              <CardContent className="py-2">
                <dl className="text-sm">
                  <div>
                    <dt className="font-medium text-muted-foreground mb-1">
                      PO ID
                    </dt>
                    <dd className="font-medium">{rate.purchase_order.PO_id}</dd>
                  </div>
                  {rate.purchase_order.contract && (
                    <div className="mt-2">
                      <dt className="font-medium text-muted-foreground mb-1">
                        Related Contract
                      </dt>
                      <dd>{rate.purchase_order.contract.job_title}</dd>
                    </div>
                  )}
                </dl>
              </CardContent>
            </Card>
          )}

          {/* Call-off Work Order Reference (if applicable) */}
          {rate.calloff_work_order && (
            <Card>
              <CardHeader className="py-3">
                <CardTitle className="text-sm">
                  Call-off Work Order Reference
                </CardTitle>
              </CardHeader>
              <CardContent className="py-2">
                <dl className="text-sm">
                  <div>
                    <dt className="font-medium text-muted-foreground mb-1">
                      CWO ID
                    </dt>
                    <dd className="font-medium">
                      {rate.calloff_work_order.CWO_id}
                    </dd>
                  </div>
                  {rate.calloff_work_order.contract && (
                    <div className="mt-2">
                      <dt className="font-medium text-muted-foreground mb-1">
                        Related Contract
                      </dt>
                      <dd>{rate.calloff_work_order.contract.job_title}</dd>
                    </div>
                  )}
                </dl>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
