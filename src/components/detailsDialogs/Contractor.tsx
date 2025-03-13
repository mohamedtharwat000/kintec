import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
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
import { Badge } from "@/components/ui/badge";
import { FileText } from "lucide-react";
import { Contractor } from "@/types/Contractor";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ContractorDetailsProps {
  contractor?: Contractor;
  open: boolean;
  onClose: () => void;
}

const formatDate = (date: Date | string | undefined) => {
  if (!date) return "N/A";
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

export function ContractorDetails({
  contractor,
  open,
  onClose,
}: ContractorDetailsProps) {
  if (!contractor) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[85vw] max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <FileText className="h-5 w-5" />
            {contractor.first_name} {contractor.last_name}
          </DialogTitle>
        </DialogHeader>

        <Card className="mb-4">
          <CardHeader>
            <CardTitle className="text-lg">Personal Information</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <dt className="font-medium text-muted-foreground mb-1">ID</dt>
                <dd>{contractor.contractor_id}</dd>
              </div>
              <div>
                <dt className="font-medium text-muted-foreground mb-1">
                  Full Name
                </dt>
                <dd className="font-medium">
                  {contractor.first_name}{" "}
                  {contractor.middle_name ? contractor.middle_name + " " : ""}
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

        {contractor.contracts && contractor.contracts.length > 0 ? (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Contracts Summary</CardTitle>
              <CardDescription>
                This contractor has {contractor.contracts.length} contract
                {contractor.contracts.length > 1 && "s"}
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
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
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Contracts</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-sm">
                No contracts found for this contractor.
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
    <Badge className={`${colorMap[status] || "bg-blue-500"}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </Badge>
  );
}
