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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { FileText, Info } from "lucide-react";
import { ClientCompany } from "@/types/ClientCompany";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ClientCompanyDetailsProps {
  company: ClientCompany;
}

// Format date to readable string
const formatDate = (date: Date) => {
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

export function ClientCompanyDetails({ company }: ClientCompanyDetailsProps) {
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
            {company.client_name}
          </DialogTitle>
          <DialogDescription className="hidden" />
        </DialogHeader>

        {/* Company Details Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Company Information</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <dt className="font-medium text-muted-foreground mb-1">ID</dt>
                <dd>{company.client_company_id}</dd>
              </div>
              <div>
                <dt className="font-medium text-muted-foreground mb-1">
                  Company Name
                </dt>
                <dd className="font-medium">{company.client_name}</dd>
              </div>
              <div>
                <dt className="font-medium text-muted-foreground mb-1">
                  Contact Email
                </dt>
                <dd>
                  <a
                    href={`mailto:${company.contact_email}`}
                    className="text-blue-600 hover:underline"
                  >
                    {company.contact_email}
                  </a>
                </dd>
              </div>
              <div>
                <dt className="font-medium text-muted-foreground mb-1">
                  Invoice Submission Deadline
                </dt>
                <dd>
                  {company.invoice_submission_deadline || "Not specified"}
                </dd>
              </div>
            </dl>
          </CardContent>
        </Card>

        {/* Contracts Summary */}
        {company.contracts && company.contracts.length > 0 ? (
          <Card className="">
            <CardHeader>
              <CardTitle className="text-lg">Contracts Summary</CardTitle>
              <CardDescription>
                This company has {company.contracts.length} contract(s)
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="rounded-md border">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader className="sticky top-0 bg-background z-10">
                      <TableRow>
                        <TableHead className="whitespace-nowrap">
                          Contract ID
                        </TableHead>
                        <TableHead className="whitespace-nowrap">
                          Job Title
                        </TableHead>
                        <TableHead className="whitespace-nowrap">
                          Job Type
                        </TableHead>
                        <TableHead className="whitespace-nowrap">
                          Job Number
                        </TableHead>
                        <TableHead className="whitespace-nowrap">
                          Status
                        </TableHead>
                        <TableHead className="whitespace-nowrap">
                          Start Date
                        </TableHead>
                        <TableHead className="whitespace-nowrap">
                          End Date
                        </TableHead>
                        <TableHead className="whitespace-nowrap">
                          Cost Centre
                        </TableHead>
                        <TableHead className="whitespace-nowrap">
                          Contractor
                        </TableHead>
                        <TableHead className="whitespace-nowrap">
                          Project
                        </TableHead>
                        <TableHead className="whitespace-nowrap">
                          PO ID
                        </TableHead>
                        <TableHead className="whitespace-nowrap">
                          Description
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {company.contracts.map((contract) => (
                        <TableRow key={contract.contract_id}>
                          <TableCell className="font-mono text-xs whitespace-nowrap">
                            {contract.contract_id}
                          </TableCell>
                          <TableCell className="whitespace-nowrap">
                            {contract.job_title}
                          </TableCell>
                          <TableCell className="whitespace-nowrap">
                            {contract.job_type}
                          </TableCell>
                          <TableCell className="whitespace-nowrap">
                            {contract.job_number}
                          </TableCell>
                          <TableCell className="whitespace-nowrap">
                            <ContractStatusBadge
                              status={contract.contract_status}
                            />
                          </TableCell>
                          <TableCell className="whitespace-nowrap">
                            {formatDate(contract.contract_start_date)}
                          </TableCell>
                          <TableCell className="whitespace-nowrap">
                            {formatDate(contract.contract_end_date)}
                          </TableCell>
                          <TableCell className="whitespace-nowrap">
                            {contract.kintec_cost_centre_code}
                          </TableCell>
                          <TableCell className="whitespace-nowrap">
                            {contract.PO_id || "N/A"}
                          </TableCell>
                          <TableCell className="max-w-[300px] truncate">
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger className="cursor-default text-left">
                                  {contract.description_of_services ||
                                    "No description"}
                                </TooltipTrigger>
                                {contract.description_of_services && (
                                  <TooltipContent
                                    side="left"
                                    className="max-w-[400px] p-4"
                                  >
                                    <p>{contract.description_of_services}</p>
                                  </TooltipContent>
                                )}
                              </Tooltip>
                            </TooltipProvider>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Contracts</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-sm">
                No contracts found for this company.
              </p>
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
