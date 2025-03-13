import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { FileText } from "lucide-react";
import { Contract } from "@/types/Contract";

interface ContractDetailsProps {
  contract?: Contract;
  open: boolean;
  onClose: () => void;
}

const formatDate = (date: Date) => {
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

export function ContractDetails({
  contract,
  open,
  onClose,
}: ContractDetailsProps) {
  if (!contract) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[85vw] max-h-[90vh] overflow-auto flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <FileText className="h-5 w-5" />
            Contract: {contract.job_title}
          </DialogTitle>
          <DialogDescription className="hidden" />
        </DialogHeader>

        {/* Contract Details Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Contract Information</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <dt className="font-medium text-muted-foreground mb-1">ID</dt>
                <dd>{contract.contract_id}</dd>
              </div>
              <div>
                <dt className="font-medium text-muted-foreground mb-1">
                  Job Title
                </dt>
                <dd className="font-medium">{contract.job_title}</dd>
              </div>
              <div>
                <dt className="font-medium text-muted-foreground mb-1">
                  Job Type
                </dt>
                <dd>{contract.job_type}</dd>
              </div>
              <div>
                <dt className="font-medium text-muted-foreground mb-1">
                  Job Number
                </dt>
                <dd>{contract.job_number}</dd>
              </div>
              <div>
                <dt className="font-medium text-muted-foreground mb-1">
                  Status
                </dt>
                <dd>
                  <ContractStatusBadge status={contract.contract_status} />
                </dd>
              </div>
              <div>
                <dt className="font-medium text-muted-foreground mb-1">
                  Cost Centre
                </dt>
                <dd>{contract.kintec_cost_centre_code}</dd>
              </div>
              <div>
                <dt className="font-medium text-muted-foreground mb-1">
                  Start Date
                </dt>
                <dd>{formatDate(contract.contract_start_date)}</dd>
              </div>
              <div>
                <dt className="font-medium text-muted-foreground mb-1">
                  End Date
                </dt>
                <dd>{formatDate(contract.contract_end_date)}</dd>
              </div>
              <div>
                <dt className="font-medium text-muted-foreground mb-1">
                  PO ID
                </dt>
                <dd>{contract.PO_id || "Not assigned"}</dd>
              </div>
            </dl>
          </CardContent>
        </Card>

        {/* Description Card */}
        <Card className="mt-4">
          <CardHeader>
            <CardTitle className="text-lg">Description of Services</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm">
              {contract.description_of_services || "No description provided"}
            </p>
          </CardContent>
        </Card>

        {/* Related Entities */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          {/* Contractor Info */}
          {contract.contractor && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Contractor</CardTitle>
              </CardHeader>
              <CardContent>
                <dl className="text-sm space-y-2">
                  <div>
                    <dt className="font-medium text-muted-foreground mb-1">
                      Name
                    </dt>
                    <dd>
                      {contract.contractor.first_name}{" "}
                      {contract.contractor.last_name}
                    </dd>
                  </div>
                  <div>
                    <dt className="font-medium text-muted-foreground mb-1">
                      Email
                    </dt>
                    <dd>
                      <a
                        href={`mailto:${contract.contractor.email_address}`}
                        className="text-blue-600 hover:underline"
                      >
                        {contract.contractor.email_address}
                      </a>
                    </dd>
                  </div>
                  <div>
                    <dt className="font-medium text-muted-foreground mb-1">
                      Phone
                    </dt>
                    <dd>{contract.contractor.phone_number}</dd>
                  </div>
                </dl>
              </CardContent>
            </Card>
          )}

          {/* Client Company Info */}
          {contract.client_company && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Client Company</CardTitle>
              </CardHeader>
              <CardContent>
                <dl className="text-sm space-y-2">
                  <div>
                    <dt className="font-medium text-muted-foreground mb-1">
                      Name
                    </dt>
                    <dd>{contract.client_company.client_name}</dd>
                  </div>
                  <div>
                    <dt className="font-medium text-muted-foreground mb-1">
                      Contact Email
                    </dt>
                    <dd>
                      <a
                        href={`mailto:${contract.client_company.contact_email}`}
                        className="text-blue-600 hover:underline"
                      >
                        {contract.client_company.contact_email}
                      </a>
                    </dd>
                  </div>
                </dl>
              </CardContent>
            </Card>
          )}

          {/* Project Info */}
          {contract.project && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Project</CardTitle>
              </CardHeader>
              <CardContent>
                <dl className="text-sm space-y-2">
                  <div>
                    <dt className="font-medium text-muted-foreground mb-1">
                      Name
                    </dt>
                    <dd>{contract.project.project_name}</dd>
                  </div>
                  <div>
                    <dt className="font-medium text-muted-foreground mb-1">
                      Type
                    </dt>
                    <dd>{contract.project.project_type}</dd>
                  </div>
                </dl>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Purchase Order Info */}
        {contract.purchase_order && (
          <Card className="mt-4">
            <CardHeader>
              <CardTitle className="text-lg">Purchase Order</CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <dt className="font-medium text-muted-foreground mb-1">
                    PO ID
                  </dt>
                  <dd>{contract.purchase_order.PO_id}</dd>
                </div>
                <div>
                  <dt className="font-medium text-muted-foreground mb-1">
                    Start Date
                  </dt>
                  <dd>{formatDate(contract.purchase_order.PO_start_date)}</dd>
                </div>
                <div>
                  <dt className="font-medium text-muted-foreground mb-1">
                    End Date
                  </dt>
                  <dd>{formatDate(contract.purchase_order.PO_end_date)}</dd>
                </div>
                <div>
                  <dt className="font-medium text-muted-foreground mb-1">
                    Total Value
                  </dt>
                  <dd>{contract.purchase_order.PO_total_value.toString()}</dd>
                </div>
                <div>
                  <dt className="font-medium text-muted-foreground mb-1">
                    Status
                  </dt>
                  <dd>{contract.purchase_order.PO_status}</dd>
                </div>
                <div>
                  <dt className="font-medium text-muted-foreground mb-1">
                    Remittance Email
                  </dt>
                  <dd>
                    <a
                      href={`mailto:${contract.purchase_order.kintec_email_for_remittance}`}
                      className="text-blue-600 hover:underline"
                    >
                      {contract.purchase_order.kintec_email_for_remittance}
                    </a>
                  </dd>
                </div>
              </dl>
            </CardContent>
          </Card>
        )}

        {/* Calloff Work Orders */}
        {contract.calloff_work_orders &&
          contract.calloff_work_orders.length > 0 && (
            <Card className="mt-4">
              <CardHeader>
                <CardTitle className="text-lg">Call-off Work Orders</CardTitle>
                <CardDescription>
                  This contract has {contract.calloff_work_orders.length}{" "}
                  call-off work order(s)
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="rounded-md border">
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader className="sticky top-0 bg-background z-10">
                        <TableRow>
                          <TableHead className="whitespace-nowrap">
                            CWO ID
                          </TableHead>
                          <TableHead className="whitespace-nowrap">
                            Start Date
                          </TableHead>
                          <TableHead className="whitespace-nowrap">
                            End Date
                          </TableHead>
                          <TableHead className="whitespace-nowrap">
                            Total Value
                          </TableHead>
                          <TableHead className="whitespace-nowrap">
                            Status
                          </TableHead>
                          <TableHead className="whitespace-nowrap">
                            Remittance Email
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {contract.calloff_work_orders.map((cwo) => (
                          <TableRow key={cwo.CWO_id}>
                            <TableCell>{cwo.CWO_id}</TableCell>
                            <TableCell>
                              {formatDate(cwo.CWO_start_date)}
                            </TableCell>
                            <TableCell>
                              {formatDate(cwo.CWO_end_date)}
                            </TableCell>
                            <TableCell>
                              {cwo.CWO_total_value.toString()}
                            </TableCell>
                            <TableCell>{cwo.CWO_status}</TableCell>
                            <TableCell>
                              {cwo.kintec_email_for_remittance}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
      </DialogContent>
    </Dialog>
  );
}

function ContractStatusBadge({ status }: { status: string }) {
  const colorMap: Record<string, string> = {
    active: "bg-green-500",
    expired: "bg-gray-500",
    terminated: "bg-red-500",
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge
            className={`${colorMap[status] || "bg-blue-500"} hover:${
              colorMap[status] || "bg-blue-500"
            }`}
          >
            {status}
          </Badge>
        </TooltipTrigger>
        <TooltipContent>
          <p>{status.charAt(0).toUpperCase() + status.slice(1)}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
