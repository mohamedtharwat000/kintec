"use client";

import { useState } from "react";
import {
  useSubmissionValidationRules,
  useDeleteSubmissionValidationRule,
  useCreateSubmissionValidationRule,
  useSearchFilter,
  useParseSubmissionValidationRuleCsv,
} from "@/hooks/useSubmissionValidationRules";
import { DataTable } from "@/components/dataTable/DataTable";
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Plus, Search, Pencil, Trash2, Upload, Info } from "lucide-react";
import { Input } from "@/components/ui/input";
import { SubmissionValidationRuleForm } from "@/components/forms/SubmissionValidationRuleForm";
import { Badge } from "@/components/ui/badge";
import { SubmissionValidationRule as SubmissionValidationRuleType } from "@/types/SubmissionValidationRule";
import { toast } from "sonner";
import { CSVPreviewDialog } from "@/components/reusableModels/CSVPreviewDialog";
import { DeleteConfirmationDialog } from "@/components/reusableModels/DeleteConfirmationDialog";
import {
  DetailsDialog,
  DetailSection,
} from "@/components/reusableModels/DetailsDialog";
import { useSubmissions } from "@/hooks/useSubmissions";

export function SubmissionValidationRule() {
  // Core data fetching hook
  const {
    data: rules = [],
    isLoading,
    refetch,
  } = useSubmissionValidationRules();
  const { data: submissions = [] } = useSubmissions();
  const deleteRule = useDeleteSubmissionValidationRule();
  const createRule = useCreateSubmissionValidationRule();
  const parseCSV = useParseSubmissionValidationRuleCsv();

  // Page-level state management
  const [searchTerm, setSearchTerm] = useState("");

  // Form dialog state
  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
  const [selectedRuleId, setSelectedRuleId] = useState<string | undefined>(
    undefined
  );

  // Details dialog state
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [selectedRuleForDetails, setSelectedRuleForDetails] = useState<
    SubmissionValidationRuleType | undefined
  >(undefined);

  // CSV dialog state
  const [isCSVDialogOpen, setIsCSVDialogOpen] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [csvData, setCsvData] = useState<any[]>([]);
  const [csvValidationErrors, setCsvValidationErrors] = useState<
    { row: number; error: string }[]
  >([]);

  // Delete dialog state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [ruleToDelete, setRuleToDelete] = useState<string | null>(null);

  // Filter data based on search term
  const filteredData = useSearchFilter<SubmissionValidationRuleType>(
    rules,
    searchTerm,
    [
      "sub_val_rule_id",
      "submission_id",
      "required_fields",
      "approval_signature_rules",
    ]
  );

  // Find the related submission for a rule
  const getSubmissionForRule = (submissionId: string) => {
    return submissions.find(
      (submission) => submission.submission_id === submissionId
    );
  };

  // Simple handlers for UI actions
  const handleAddClick = () => {
    setSelectedRuleId(undefined);
    setIsFormDialogOpen(true);
  };

  const handleEditClick = (ruleId: string) => {
    setSelectedRuleId(ruleId);
    setIsFormDialogOpen(true);
  };

  const handleDetailsClick = (rule: SubmissionValidationRuleType) => {
    setSelectedRuleForDetails(rule);
    setIsDetailsDialogOpen(true);
  };

  const handleDeleteClick = (ruleId: string) => {
    setRuleToDelete(ruleId);
    setDeleteDialogOpen(true);
  };

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      setUploadFile(file);

      const result = await parseCSV(file);
      if (result.data) {
        setCsvData(result.data.data);
        setCsvValidationErrors(result.data.errors);
        setIsCSVDialogOpen(true);
      } else if (result.error) {
        toast.error(`Failed to parse CSV: ${result.error.message}`);
      }

      event.target.value = "";
    }
  };

  const handleCSVDialogClose = () => {
    setIsCSVDialogOpen(false);
    setCsvData([]);
    setCsvValidationErrors([]);
    setUploadFile(null);
  };

  const handleCsvUpload = async () => {
    if (!csvData.length) return;

    try {
      await createRule.mutateAsync(csvData);
      toast.success(`Successfully imported ${csvData.length} validation rules`);
      refetch();
      setIsCSVDialogOpen(false);

      setCsvData([]);
      setCsvValidationErrors([]);
      setUploadFile(null);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      toast.error(`Failed to import validation rules: ${errorMessage}`);
    }
  };

  const handleFormSuccess = () => {
    refetch();
    setIsFormDialogOpen(false);
  };

  // Generate detail sections for the rule
  const getRuleDetailSections = (): DetailSection[] => {
    if (!selectedRuleForDetails) return [];

    const relatedSubmission = getSubmissionForRule(
      selectedRuleForDetails.submission_id
    );

    return [
      {
        title: "Validation Rule Information",
        items: [
          { label: "Rule ID", value: selectedRuleForDetails.sub_val_rule_id },
          {
            label: "Submission ID",
            value: selectedRuleForDetails.submission_id,
          },
          {
            label: "Required Fields",
            value: selectedRuleForDetails.required_fields || "Not specified",
          },
          {
            label: "Approval Signature Rules",
            value:
              selectedRuleForDetails.approval_signature_rules ||
              "Not specified",
          },
          {
            label: "Approval Date Rules",
            value:
              selectedRuleForDetails.approval_date_rules || "Not specified",
          },
          {
            label: "Template Requirements",
            value:
              selectedRuleForDetails.template_requirements || "Not specified",
          },
          {
            label: "Workday Definitions",
            value:
              selectedRuleForDetails.workday_definitions || "Not specified",
          },
        ],
      },
      ...(relatedSubmission
        ? [
            {
              title: "Related Submission",
              items: [
                {
                  label: "Submission ID",
                  value: relatedSubmission.submission_id,
                },
                {
                  label: "Billing Period",
                  value: new Date(
                    relatedSubmission.billing_period
                  ).toLocaleDateString(),
                },
                {
                  label: "Payment Currency",
                  value: relatedSubmission.payment_currency,
                },
              ],
            },
          ]
        : []),
    ];
  };

  const columns: ColumnDef<SubmissionValidationRuleType>[] = [
    {
      accessorKey: "sub_val_rule_id",
      header: "Rule ID",
      cell: ({ row }) => (
        <div className="font-mono text-xs truncate max-w-[120px] md:max-w-none">
          {row.getValue("sub_val_rule_id")}
        </div>
      ),
    },
    {
      accessorKey: "submission_id",
      header: "Submission ID",
      cell: ({ row }) => (
        <div className="truncate max-w-[120px] md:max-w-none">
          {row.getValue("submission_id")}
        </div>
      ),
    },
    {
      accessorKey: "required_fields",
      header: "Required Fields",
      cell: ({ row }) => (
        <div className="truncate max-w-[120px] md:max-w-none">
          {row.getValue("required_fields") || "N/A"}
        </div>
      ),
    },
    {
      accessorKey: "approval_signature_rules",
      header: "Signature Rules",
      cell: ({ row }) => (
        <div className="truncate max-w-[150px] md:max-w-none">
          {row.getValue("approval_signature_rules") || "N/A"}
        </div>
      ),
    },
    {
      accessorKey: "approval_date_rules",
      header: "Date Rules",
      cell: ({ row }) => (
        <div className="truncate max-w-[150px] md:max-w-none">
          {row.getValue("approval_date_rules") || "N/A"}
        </div>
      ),
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        return (
          <div className="flex justify-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleEditClick(row.original.sub_val_rule_id)}
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleDeleteClick(row.original.sub_val_rule_id)}
            >
              <Trash2 className="h-4 w-4 text-red-500" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleDetailsClick(row.original)}
            >
              <Info className="h-4 w-4" />
            </Button>
          </div>
        );
      },
    },
  ];

  return (
    <div className="flex flex-col gap-4 p-4">
      <h1 className="text-xl sm:text-2xl font-semibold">
        Submission Validation Rules
      </h1>
      <div className="flex flex-wrap justify-between items-center gap-2">
        <div className="relative flex flex-1 items-center gap-2">
          <Button
            size="sm"
            className="w-full sm:w-auto"
            onClick={handleAddClick}
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Validation Rule
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="w-full sm:w-auto"
            onClick={() => document.getElementById("csv-upload")?.click()}
          >
            <Upload className="mr-2 h-4 w-4" />
            Upload CSV
          </Button>
          <input
            type="file"
            accept=".csv"
            onChange={handleFileChange}
            className="hidden"
            id="csv-upload"
          />
        </div>

        <div className="relative flex flex-1 items-center justify-center gap-2 p-2 min-w-16">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
          <Input
            className="pl-10"
            placeholder="Search validation rules..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Data Table */}
      <DataTable
        columns={columns}
        data={filteredData}
        loading={isLoading}
        pageSize={10}
      />

      {/* Add/Edit Form Dialog */}
      <SubmissionValidationRuleForm
        ruleId={selectedRuleId}
        open={isFormDialogOpen}
        onClose={() => setIsFormDialogOpen(false)}
        onSuccess={handleFormSuccess}
      />

      {/* Details Dialog */}
      {selectedRuleForDetails && (
        <DetailsDialog
          title={`Validation Rule: ${selectedRuleForDetails.sub_val_rule_id}`}
          open={isDetailsDialogOpen}
          onClose={() => setIsDetailsDialogOpen(false)}
          sections={getRuleDetailSections()}
        />
      )}

      {/* CSV Preview Dialog */}
      {uploadFile && (
        <CSVPreviewDialog
          isOpen={isCSVDialogOpen}
          onClose={handleCSVDialogClose}
          data={csvData}
          fileName={uploadFile.name}
          onConfirm={handleCsvUpload}
          validationErrors={csvValidationErrors}
          title="Import Validation Rules"
          description="Review validation rule data before import"
        />
      )}

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmationDialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onDelete={deleteRule.mutateAsync}
        itemId={ruleToDelete}
        title="Delete Validation Rule"
        description="Are you sure you want to delete this validation rule? This action cannot be undone."
        successMessage="Validation rule deleted successfully"
        errorMessage="Failed to delete validation rule"
      />
    </div>
  );
}
