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
import { FileText } from "lucide-react";
import { Project } from "@/types/Project";

interface ProjectDetailsProps {
  project: Project;
  open: boolean;
  onClose: () => void;
}

export function ProjectDetails({
  project,
  open,
  onClose,
}: ProjectDetailsProps) {
  const projectRulesCount = project.project_rules?.length || 0;
  const contractsCount = project.contracts?.length || 0;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[85vw] max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <FileText className="h-5 w-5" />
            {project.project_name}
          </DialogTitle>
          <DialogDescription className="hidden" />
        </DialogHeader>

        {/* Project Details Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Project Information</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <dt className="font-medium text-muted-foreground mb-1">ID</dt>
                <dd>{project.project_id}</dd>
              </div>
              <div>
                <dt className="font-medium text-muted-foreground mb-1">
                  Project Name
                </dt>
                <dd className="font-medium">{project.project_name}</dd>
              </div>
              <div>
                <dt className="font-medium text-muted-foreground mb-1">
                  Project Type
                </dt>
                <dd>{project.project_type}</dd>
              </div>
              <div>
                <dt className="font-medium text-muted-foreground mb-1">
                  Associated Contracts
                </dt>
                <dd>{contractsCount} contract(s)</dd>
              </div>
            </dl>
          </CardContent>
        </Card>

        {/* Contracts Summary */}
        {project.contracts && project.contracts.length > 0 ? (
          <Card className="mt-4">
            <CardHeader>
              <CardTitle className="text-lg">Contracts Summary</CardTitle>
              <CardDescription>
                This project has {project.contracts.length} contract(s)
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
                          Client Company
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {project.contracts.map((contract) => (
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
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <span
                                    className={`px-2 py-1 rounded-full text-xs ${
                                      contract.contract_status === "active"
                                        ? "bg-green-100 text-green-800"
                                        : contract.contract_status === "expired"
                                        ? "bg-gray-100 text-gray-800"
                                        : "bg-red-100 text-red-800"
                                    }`}
                                  >
                                    {contract.contract_status}
                                  </span>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>
                                    {contract.contract_status
                                      .charAt(0)
                                      .toUpperCase() +
                                      contract.contract_status.slice(1)}
                                  </p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </TableCell>
                          <TableCell className="whitespace-nowrap">
                            {new Date(
                              contract.contract_start_date
                            ).toLocaleDateString()}
                          </TableCell>
                          <TableCell className="whitespace-nowrap">
                            {new Date(
                              contract.contract_end_date
                            ).toLocaleDateString()}
                          </TableCell>
                          <TableCell className="whitespace-nowrap">
                            {contract.client_company?.client_name || "N/A"}
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
          <Card className="mt-4">
            <CardHeader>
              <CardTitle className="text-lg">Contracts</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-sm">
                No contracts found for this project.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Project Rules */}
        {project.project_rules && project.project_rules.length > 0 && (
          <Card className="mt-4">
            <CardHeader>
              <CardTitle className="text-lg">Project Rules</CardTitle>
              <CardDescription>
                There are {projectRulesCount} rules for this project
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {project.project_rules.map((rule) => (
                  <div
                    key={rule.project_rule_id}
                    className="border rounded-md p-4"
                  >
                    <dl className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <dt className="font-medium text-muted-foreground mb-1">
                          Rule ID
                        </dt>
                        <dd className="font-mono text-xs">
                          {rule.project_rule_id}
                        </dd>
                      </div>
                      {rule.special_project_rules && (
                        <div>
                          <dt className="font-medium text-muted-foreground mb-1">
                            Special Rules
                          </dt>
                          <dd>{rule.special_project_rules}</dd>
                        </div>
                      )}
                      {rule.project_rules_reviewer_name && (
                        <div>
                          <dt className="font-medium text-muted-foreground mb-1">
                            Reviewer
                          </dt>
                          <dd>{rule.project_rules_reviewer_name}</dd>
                        </div>
                      )}
                      {rule.additional_review_process && (
                        <div>
                          <dt className="font-medium text-muted-foreground mb-1">
                            Additional Review
                          </dt>
                          <dd>{rule.additional_review_process}</dd>
                        </div>
                      )}
                      <div>
                        <dt className="font-medium text-muted-foreground mb-1">
                          Major Project
                        </dt>
                        <dd>{rule.major_project_indicator ? "Yes" : "No"}</dd>
                      </div>
                    </dl>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </DialogContent>
    </Dialog>
  );
}
