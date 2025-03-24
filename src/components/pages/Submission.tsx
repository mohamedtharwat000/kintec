"use client";

import { useState } from "react";
import {
  useSubmissions,
  useDeleteSubmission,
  useCreateSubmission,
  useSearchFilter,
  useParseSubmissionCsv,
} from "@/hooks/useSubmissions";
import { DataTable } from "@/components/dataTable/DataTable";
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Plus, Search, Pencil, Trash2, Upload, Info } from "lucide-react";
import { Input } from "@/components/ui/input";
import { SubmissionForm } from "@/components/forms/SubmissionForm";
import { Badge } from "@/components/ui/badge";
import { SubmissionView } from "@/types/Submission";
import { toast } from "sonner";
import { CSVPreviewDialog } from "@/components/reusableModels/CSVPreviewDialog";
import { DeleteConfirmationDialog } from "@/components/reusableModels/DeleteConfirmationDialog";
import {
  DetailsDialog,
  DetailSection,
} from "@/components/reusableModels/DetailsDialog";
import { format } from "date-fns";

export function Submission() {
  // Core data fetching hook
  const { data: submissions = [], isLoading, refetch } = useSubmissions();
  const deleteSubmission = useDeleteSubmission();
  const createSubmission = useCreateSubmission();
  const parseCSV = useParseSubmissionCsv();

  // Page-level state management
  const [searchTerm, setSearchTerm] = useState("");

  // Form dialog state
  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
  const [selectedSubmissionId, setSelectedSubmissionId] = useState<
    string | undefined
  >();

  // Details dialog state
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [selectedSubmissionForDetails, setSelectedSubmissionForDetails] =
    useState<SubmissionView | undefined>(undefined);

  // CSV dialog state
  const [isCSVDialogOpen, setIsCSVDialogOpen] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [csvData, setCsvData] = useState<any[]>([]);
  const [csvValidationErrors, setCsvValidationErrors] = useState<
    { row: number; error: string }[]
  >([]);

  // Delete dialog state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [submissionToDelete, setSubmissionToDelete] = useState<string | null>(
    null
  );

  // Filter data based on search term
  const filteredData = useSearchFilter<SubmissionView>(
    submissions,
    searchTerm,
    ["submission_id", "contractor_id", "payment_currency", "invoice_currency"]
  );

  // Simple handlers for UI actions
  const handleAddClick = () => {
    setSelectedSubmissionId(undefined);
    setIsFormDialogOpen(true);
  };

  const handleEditClick = (submissionId: string) => {
    setSelectedSubmissionId(submissionId);
    setIsFormDialogOpen(true);
  };

  const handleDetailsClick = (submission: SubmissionView) => {
    setSelectedSubmissionForDetails(submission);
    setIsDetailsDialogOpen(true);
  };

  const handleDeleteClick = (submissionId: string) => {
    setSubmissionToDelete(submissionId);
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
      await createSubmission.mutateAsync(csvData);
      toast.success(`Successfully imported ${csvData.length} submissions`);
      refetch();
      setIsCSVDialogOpen(false);

      setCsvData([]);
      setCsvValidationErrors([]);
      setUploadFile(null);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      toast.error(`Failed to import submissions: ${errorMessage}`);
    }
  };

  const handleFormSuccess = () => {
    refetch();
    setIsFormDialogOpen(false);
  };

  const formatDate = (date: Date) => {
    return format(new Date(date), "PP");
  };

  // Generate detail sections for the submission
  const getSubmissionDetailSections = (): DetailSection[] => {
    if (!selectedSubmissionForDetails) return [];

    return [
      {
        title: "Submission Information",
        items: [
          {
            label: "Submission ID",
            value: selectedSubmissionForDetails.submission_id,
          },
          {
            label: "Billing Period",
            value: formatDate(selectedSubmissionForDetails.billing_period),
          },
          {
            label: "Invoice Due Date",
            value: formatDate(selectedSubmissionForDetails.invoice_due_date),
          },
          {
            label: "Payment Currency",
            value: selectedSubmissionForDetails.payment_currency,
          },
          {
            label: "Invoice Currency",
            value: selectedSubmissionForDetails.invoice_currency,
          },
          {
            label: "Withholding Tax",
            value: selectedSubmissionForDetails.wht_applicable
              ? `${selectedSubmissionForDetails.wht_rate}%`
              : "Not Applicable",
          },
          {
            label: "External Assignment",
            value: selectedSubmissionForDetails.external_assignment
              ? "Yes"
              : "No",
          },
        ],
      },
      ...(selectedSubmissionForDetails.validation_rules?.length
        ? [
            {
              title: "Validation Rules",
              items: selectedSubmissionForDetails.validation_rules.map(
                (rule) => ({
                  label: "Rule ID",
                  value: rule.sub_val_rule_id,
                })
              ),
            },
          ]
        : []),
      ...(selectedSubmissionForDetails.reviews?.length
        ? [
            {
              title: "Reviews",
              items: selectedSubmissionForDetails.reviews.map((review) => ({
                label: `Review by ${review.reviewer_name}`,
                value: (
                  <Badge
                    className={
                      review.review_status === "approved"
                        ? "bg-green-500"
                        : review.review_status === "rejected"
                          ? "bg-red-500"
                          : "bg-yellow-500"
                    }
                  >
                    {review.review_status}
                  </Badge>
                ),
              })),
            },
          ]
        : []),
    ];
  };

  const columns: ColumnDef<SubmissionView>[] = [
    {
      accessorKey: "submission_id",
      header: "Submission ID",
      cell: ({ row }) => (
        <div className="font-mono text-xs truncate max-w-[120px] md:max-w-none">
          {row.getValue("submission_id")}
        </div>
      ),
    },
    {
      accessorKey: "billing_period",
      header: "Billing Period",
      cell: ({ row }) => {
        return <div>{formatDate(row.getValue("billing_period"))}</div>;
      },
    },
    {
      accessorKey: "invoice_due_date",
      header: "Due Date",
      cell: ({ row }) => {
        return <div>{formatDate(row.getValue("invoice_due_date"))}</div>;
      },
    },
    {
      id: "whtInfo",
      header: "WHT",
      cell: ({ row }) => {
        const whtApplicable = row.original.wht_applicable;
        const whtRate = row.original.wht_rate;

        if (whtApplicable && whtRate !== undefined && whtRate !== null) {
          return <div>{whtRate}%</div>;
        }
        return <div>N/A</div>;
      },
    },
    {
      accessorKey: "external_assignment",
      header: "External",
      cell: ({ row }) => {
        const isExternal = row.getValue("external_assignment") as boolean;
        return <div>{isExternal ? "Yes" : "No"}</div>;
      },
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        return (
          <div className="flex justify-center gap-2">
            {/* <Button
              variant="ghost"
              size="icon"
              onClick={() => handleEditClick(row.original.submission_id)}
            >
              <Pencil className="h-4 w-4" />
            </Button> */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleDeleteClick(row.original.submission_id)}
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
      <h1 className="text-xl sm:text-2xl font-semibold">Submissions</h1>
      <div className="flex flex-wrap justify-between items-center gap-2">
        <div className="relative flex flex-1 items-center gap-2">
          <Button
            size="sm"
            className="w-full sm:w-auto"
            onClick={handleAddClick}
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Submission
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
            placeholder="Search submissions..."
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
      <SubmissionForm
        submissionId={selectedSubmissionId}
        open={isFormDialogOpen}
        onClose={() => setIsFormDialogOpen(false)}
        onSuccess={handleFormSuccess}
      />

      {/* Details Dialog */}
      {selectedSubmissionForDetails && (
        <DetailsDialog
          title={`Submission: ${selectedSubmissionForDetails.submission_id}`}
          open={isDetailsDialogOpen}
          onClose={() => setIsDetailsDialogOpen(false)}
          sections={getSubmissionDetailSections()}
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
          title="Import Submissions"
          description="Review submission data before import"
        />
      )}

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmationDialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onDelete={deleteSubmission.mutateAsync}
        itemId={submissionToDelete}
        title="Delete Submission"
        description="Are you sure you want to delete this submission? This action cannot be undone."
        successMessage="Submission deleted successfully"
        errorMessage="Failed to delete submission"
      />
    </div>
  );
}
