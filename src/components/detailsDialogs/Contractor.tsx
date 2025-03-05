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
import { Contractor } from "@/types/Contractor";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface ContractorDetailsProps {
  contractor: Contractor;
}

// Format date to readable string
const formatDate = (date: Date | string | undefined) => {
  if (!date) return "N/A";
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

export function ContractorDetails({ contractor }: ContractorDetailsProps) {
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
            {contractor.first_name} {contractor.last_name}
          </DialogTitle>
          <DialogDescription>ID: {contractor.contractor_id}</DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="personal" className="w-full">
          <TabsList className="grid grid-cols-5 w-full mb-4">
            <TabsTrigger value="personal">Personal Details</TabsTrigger>
            <TabsTrigger value="visaId">ID & Visa</TabsTrigger>
            <TabsTrigger value="bank">Bank Details</TabsTrigger>
            <TabsTrigger value="contracts">Contracts</TabsTrigger>
            <TabsTrigger value="submissions">Submissions</TabsTrigger>
          </TabsList>

          <TabsContent value="personal">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Personal Information</CardTitle>
              </CardHeader>
              <CardContent>
                <dl className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <dt className="font-medium text-muted-foreground mb-1">
                      ID
                    </dt>
                    <dd>{contractor.contractor_id}</dd>
                  </div>
                  <div>
                    <dt className="font-medium text-muted-foreground mb-1">
                      Full Name
                    </dt>
                    <dd className="font-medium">
                      {contractor.first_name}{" "}
                      {contractor.middle_name
                        ? contractor.middle_name + " "
                        : ""}
                      {contractor.last_name}
                    </dd>
                  </div>
                  <div>
                    <dt className="font-medium text-muted-foreground mb-1">
                      Date of Birth
                    </dt>
                    <dd>{formatDate(contractor.date_of_birth)}</dd>
                  </div>
                  <div>
                    <dt className="font-medium text-muted-foreground mb-1">
                      Email Address
                    </dt>
                    <dd>
                      <a
                        href={`mailto:${contractor.email_address}`}
                        className="text-blue-600 hover:underline"
                      >
                        {contractor.email_address}
                      </a>
                    </dd>
                  </div>
                  <div>
                    <dt className="font-medium text-muted-foreground mb-1">
                      Phone Number
                    </dt>
                    <dd>{contractor.phone_number}</dd>
                  </div>
                  <div>
                    <dt className="font-medium text-muted-foreground mb-1">
                      Nationality
                    </dt>
                    <dd>{contractor.nationality}</dd>
                  </div>
                  <div>
                    <dt className="font-medium text-muted-foreground mb-1">
                      Country of Residence
                    </dt>
                    <dd>{contractor.country_of_residence}</dd>
                  </div>
                  <div className="md:col-span-2">
                    <dt className="font-medium text-muted-foreground mb-1">
                      Address
                    </dt>
                    <dd>{contractor.address}</dd>
                  </div>
                </dl>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="visaId">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">ID & Visa Information</CardTitle>
              </CardHeader>
              <CardContent>
                {contractor.visa_details &&
                contractor.visa_details.length > 0 ? (
                  <dl className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <dt className="font-medium text-muted-foreground mb-1">
                        Visa Number
                      </dt>
                      <dd>{contractor.visa_details[0].visa_number}</dd>
                    </div>
                    <div>
                      <dt className="font-medium text-muted-foreground mb-1">
                        Visa Type
                      </dt>
                      <dd>{contractor.visa_details[0].visa_type}</dd>
                    </div>
                    <div>
                      <dt className="font-medium text-muted-foreground mb-1">
                        Visa Country
                      </dt>
                      <dd>{contractor.visa_details[0].visa_country}</dd>
                    </div>
                    <div>
                      <dt className="font-medium text-muted-foreground mb-1">
                        Visa Status
                      </dt>
                      <dd>
                        <Badge
                          variant={
                            contractor.visa_details[0].visa_status === "active"
                              ? "default"
                              : contractor.visa_details[0].visa_status ===
                                "expired"
                              ? "secondary"
                              : "destructive"
                          }
                        >
                          {contractor.visa_details[0].visa_status}
                        </Badge>
                      </dd>
                    </div>
                    <div>
                      <dt className="font-medium text-muted-foreground mb-1">
                        Visa Expiry Date
                      </dt>
                      <dd>
                        {formatDate(
                          contractor.visa_details[0].visa_expiry_date
                        )}
                      </dd>
                    </div>
                    <div>
                      <dt className="font-medium text-muted-foreground mb-1">
                        Visa Sponsor
                      </dt>
                      <dd>{contractor.visa_details[0].visa_sponsor}</dd>
                    </div>
                    <div>
                      <dt className="font-medium text-muted-foreground mb-1">
                        Country ID Number
                      </dt>
                      <dd>{contractor.visa_details[0].country_id_number}</dd>
                    </div>
                    <div>
                      <dt className="font-medium text-muted-foreground mb-1">
                        Country ID Type
                      </dt>
                      <dd>{contractor.visa_details[0].country_id_type}</dd>
                    </div>
                    <div>
                      <dt className="font-medium text-muted-foreground mb-1">
                        Country ID Expiry Date
                      </dt>
                      <dd>
                        {formatDate(
                          contractor.visa_details[0].country_id_expiry_date
                        )}
                      </dd>
                    </div>
                    <div>
                      <dt className="font-medium text-muted-foreground mb-1">
                        Country ID Status
                      </dt>
                      <dd>
                        <Badge
                          variant={
                            contractor.visa_details[0].country_id_status ===
                            "active"
                              ? "default"
                              : contractor.visa_details[0].country_id_status ===
                                "expired"
                              ? "secondary"
                              : "destructive"
                          }
                        >
                          {contractor.visa_details[0].country_id_status}
                        </Badge>
                      </dd>
                    </div>
                  </dl>
                ) : (
                  <p className="text-muted-foreground text-sm">
                    No visa or ID details available.
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="bank">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Bank Details</CardTitle>
              </CardHeader>
              <CardContent>
                {contractor.bank_details &&
                contractor.bank_details.length > 0 ? (
                  <dl className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <dt className="font-medium text-muted-foreground mb-1">
                        Bank Name
                      </dt>
                      <dd>{contractor.bank_details[0].bank_name}</dd>
                    </div>
                    <div>
                      <dt className="font-medium text-muted-foreground mb-1">
                        Account Number
                      </dt>
                      <dd>{contractor.bank_details[0].account_number}</dd>
                    </div>
                    <div>
                      <dt className="font-medium text-muted-foreground mb-1">
                        IBAN
                      </dt>
                      <dd>{contractor.bank_details[0].IBAN}</dd>
                    </div>
                    <div>
                      <dt className="font-medium text-muted-foreground mb-1">
                        SWIFT
                      </dt>
                      <dd>{contractor.bank_details[0].SWIFT}</dd>
                    </div>
                    <div>
                      <dt className="font-medium text-muted-foreground mb-1">
                        Currency
                      </dt>
                      <dd>{contractor.bank_details[0].currency}</dd>
                    </div>
                    <div>
                      <dt className="font-medium text-muted-foreground mb-1">
                        Type
                      </dt>
                      <dd>
                        <Badge>
                          {contractor.bank_details[0].bank_detail_type}
                        </Badge>
                      </dd>
                    </div>
                    <div>
                      <dt className="font-medium text-muted-foreground mb-1">
                        Validated
                      </dt>
                      <dd>
                        {contractor.bank_details[0].bank_detail_validated
                          ? "Yes"
                          : "No"}
                      </dd>
                    </div>
                    <div>
                      <dt className="font-medium text-muted-foreground mb-1">
                        Last Updated
                      </dt>
                      <dd>
                        {formatDate(contractor.bank_details[0].last_updated)}
                      </dd>
                    </div>
                  </dl>
                ) : (
                  <p className="text-muted-foreground text-sm">
                    No bank details available.
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="contracts">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Contracts</CardTitle>
                <CardDescription>
                  {contractor.contracts && contractor.contracts.length > 0
                    ? `This contractor has ${contractor.contracts.length} contract(s)`
                    : "No contracts found for this contractor"}
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                {contractor.contracts && contractor.contracts.length > 0 ? (
                  <div className="rounded-md border">
                    <ScrollArea className="h-[350px]">
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
                              Status
                            </TableHead>
                            <TableHead className="whitespace-nowrap">
                              Start Date
                            </TableHead>
                            <TableHead className="whitespace-nowrap">
                              End Date
                            </TableHead>
                            <TableHead className="whitespace-nowrap">
                              Company
                            </TableHead>
                            <TableHead className="whitespace-nowrap">
                              Cost Centre
                            </TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {contractor.contracts.map((contract) => (
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
                                {contract.client_company?.client_name || "N/A"}
                              </TableCell>
                              <TableCell className="whitespace-nowrap">
                                {contract.kintec_cost_centre_code}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </ScrollArea>
                  </div>
                ) : (
                  <p className="text-muted-foreground text-sm p-4">
                    No contracts available for this contractor.
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="submissions">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Submissions</CardTitle>
                <CardDescription>
                  {contractor.submissions && contractor.submissions.length > 0
                    ? `This contractor has ${contractor.submissions.length} submission(s)`
                    : "No submissions found for this contractor"}
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                {contractor.submissions && contractor.submissions.length > 0 ? (
                  <div className="rounded-md border">
                    <ScrollArea className="h-[350px]">
                      <Table>
                        <TableHeader className="sticky top-0 bg-background z-10">
                          <TableRow>
                            <TableHead className="whitespace-nowrap">
                              Submission ID
                            </TableHead>
                            <TableHead className="whitespace-nowrap">
                              Billing Period
                            </TableHead>
                            <TableHead className="whitespace-nowrap">
                              Payment Currency
                            </TableHead>
                            <TableHead className="whitespace-nowrap">
                              Invoice Currency
                            </TableHead>
                            <TableHead className="whitespace-nowrap">
                              Due Date
                            </TableHead>
                            <TableHead className="whitespace-nowrap">
                              WHT Rate
                            </TableHead>
                            <TableHead className="whitespace-nowrap">
                              WHT Applicable
                            </TableHead>
                            <TableHead className="whitespace-nowrap">
                              External Assignment
                            </TableHead>
                            <TableHead className="whitespace-nowrap">
                              PO ID
                            </TableHead>
                            <TableHead className="whitespace-nowrap">
                              CWO ID
                            </TableHead>
                            <TableHead className="whitespace-nowrap">
                              Review Status
                            </TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {contractor.submissions.map((submission) => (
                            <TableRow key={submission.submission_id}>
                              <TableCell className="font-mono text-xs whitespace-nowrap">
                                {submission.submission_id}
                              </TableCell>
                              <TableCell className="whitespace-nowrap">
                                {formatDate(submission.billing_period)}
                              </TableCell>
                              <TableCell className="whitespace-nowrap">
                                {submission.payment_currency}
                              </TableCell>
                              <TableCell className="whitespace-nowrap">
                                {submission.invoice_currency}
                              </TableCell>
                              <TableCell className="whitespace-nowrap">
                                {formatDate(submission.invoice_due_date)}
                              </TableCell>
                              <TableCell className="whitespace-nowrap">
                                {submission.wht_rate !== undefined
                                  ? `${submission.wht_rate}%`
                                  : "N/A"}
                              </TableCell>
                              <TableCell className="whitespace-nowrap">
                                {submission.wht_applicable !== undefined
                                  ? submission.wht_applicable
                                    ? "Yes"
                                    : "No"
                                  : "N/A"}
                              </TableCell>
                              <TableCell className="whitespace-nowrap">
                                {submission.external_assignment !== undefined
                                  ? submission.external_assignment
                                    ? "Yes"
                                    : "No"
                                  : "N/A"}
                              </TableCell>
                              <TableCell className="whitespace-nowrap">
                                {submission.PO_id || "N/A"}
                              </TableCell>
                              <TableCell className="whitespace-nowrap">
                                {submission.CWO_id || "N/A"}
                              </TableCell>
                              <TableCell className="whitespace-nowrap">
                                {submission.reviews &&
                                submission.reviews.length > 0 ? (
                                  <SubmissionStatusBadge
                                    status={submission.reviews[0].review_status}
                                  />
                                ) : (
                                  "No reviews"
                                )}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </ScrollArea>
                  </div>
                ) : (
                  <p className="text-muted-foreground text-sm p-4">
                    No submissions available for this contractor.
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
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

function SubmissionStatusBadge({ status }: { status: string }) {
  const colorMap: Record<string, string> = {
    approved: "bg-green-500",
    pending: "bg-amber-500",
    rejected: "bg-red-500",
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
