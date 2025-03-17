"use client";

import { useState } from "react";
import {
  useSubmissions,
  useDeleteSubmission,
  useCreateSubmission,
} from "@/hooks/useSubmissions";
import { DataTable } from "@/components/dataTable/DataTable";
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Plus, Search, Pencil, Trash2, Upload, Info } from "lucide-react";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Submission as SubmissionType } from "@/types/Submission";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { SubmissionForm } from "@/components/forms/SubmissionForm";
import { SubmissionDetails } from "@/components/000/SubmissionDetails";
import { CSVPreviewDialog } from "@/components/csvPreviewDialog/Submission";
import { parseSubmission } from "@/lib/csv/submission";
import { format } from "date-fns";

export function Submission() {
  const { data: submissions = [], isLoading } = useSubmissions();
  const deleteSubmission = useDeleteSubmission();
  const createSubmission = useCreateSubmission();

  const [searchTerm, setSearchTerm] = useState("");
  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
  const [selectedSubmissionId, setSelectedSubmissionId] = useState<
    string | null
  >(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [submissionToDelete, setSubmissionToDelete] = useState<string | null>(
    null
  );
  const [viewDetailsOpen, setViewDetailsOpen] = useState(false);
  const [selectedSubmission, setSelectedSubmission] =
    useState<SubmissionType | null>(null);

  // CSV upload state
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [csvData, setCsvData] = useState<any[]>([]);
  const [csvDataToUpload, setCsvDataToUpload] = useState<any[]>([]);
  const [csvFileName, setCsvFileName] = useState("");
  const [validationErrors, setValidationErrors] = useState<
    { row: number; error: string }[]
  >([]);

  const handleAddClick = () => {
    setSelectedSubmissionId(null);
    setIsFormDialogOpen(true);
  };

  const handleEditClick = (submissionId: string) => {
    setSelectedSubmissionId(submissionId);
    setIsFormDialogOpen(true);
  };

  const handleViewDetails = (submission: SubmissionType) => {
    setSelectedSubmission(submission);
    setViewDetailsOpen(true);
  };

  const handleDeleteClick = (submissionId: string) => {
    setSubmissionToDelete(submissionId);
    setDeleteDialogOpen(true);
  };

  const handleFormClose = () => {
    setIsFormDialogOpen(false);
  };

  const handleFormSuccess = () => {
    // The form itself will handle success actions
  };

  const handleConfirmDelete = async () => {
    if (!submissionToDelete) return;

    try {
      await deleteSubmission.mutateAsync(submissionToDelete);
      toast.success("Submission deleted successfully");
    } catch (error) {
      toast.error("Failed to delete submission");
    } finally {
      setDeleteDialogOpen(false);
      setSubmissionToDelete(null);
    }
  };

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      // Parse CSV file using the dedicated parser
      const result = await parseSubmission(file);

      setCsvFileName(file.name);
      setCsvData(result.data);
      setCsvDataToUpload(result.dataToUpload);
      setValidationErrors(result.errors);

      // Show preview dialog
      setIsPreviewOpen(true);
    } catch (error) {
      console.error("Error parsing CSV:", error);
      toast.error("Failed to parse CSV file");
    } finally {
      // Reset the file input
      event.target.value = "";
    }
  };

  // Handle CSV data import confirmation
  const handleConfirmCsvUpload = async () => {
    try {
      // Submit all CSV data as an array to the API
      await Promise.all(
        csvDataToUpload.map((submission) =>
          createSubmission.mutateAsync(submission)
        )
      );

      toast.success(
        `Successfully imported ${csvDataToUpload.length} submissions`
      );
      setCsvData([]);
      setCsvDataToUpload([]);
      setCsvFileName("");
      return Promise.resolve();
    } catch (error) {
      console.error("Error importing CSV data:", error);
      toast.error("Failed to import submissions from CSV");
      return Promise.reject(error);
    }
  };

  const columns: ColumnDef<SubmissionType>[] = [
    {
      accessorKey: "submission_id",
      header: "ID",
      cell: ({ row }) => (
        <div className="font-mono text-xs w-32 truncate">
          {row.getValue("submission_id")}
        </div>
      ),
    },
    {
      accessorKey: "contractor_id",
      header: "Contractor ID",
      cell: ({ row }) => (
        <div className="font-mono text-xs w-32 truncate">
          {row.getValue("contractor_id")}
        </div>
      ),
    },
    {
      id: "order_id",
      header: "Order ID",
      cell: ({ row }) => {
        const submission = row.original;
        return (
          <div className="font-mono text-xs w-32 truncate">
            {submission.PO_id || submission.CWO_id || "N/A"}
          </div>
        );
      },
    },
    {
      id: "order_type",
      header: "Order Type",
      cell: ({ row }) => {
        const submission = row.original;
        return (
          <div className="w-24 truncate">
            {submission.PO_id ? "PO" : submission.CWO_id ? "CWO" : "N/A"}
          </div>
        );
      },
    },
    {
      accessorKey: "billing_period",
      header: "Billing Period",
      cell: ({ row }) => {
        const date = row.getValue<Date>("billing_period");
        return (
          <div className="w-28 truncate">
            {date ? format(new Date(date), "dd MMM yyyy") : "N/A"}
          </div>
        );
      },
    },
    {
      id: "currencies",
      header: "Currencies",
      cell: ({ row }) => {
        const submission = row.original;
        return (
          <div className="w-36 truncate">
            {`${submission.payment_currency} / ${submission.invoice_currency}`}
          </div>
        );
      },
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <div className="flex space-x-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleEditClick(row.original.submission_id)}
          >
            <Pencil className="h-4 w-4" />
          </Button>
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
            onClick={() => handleViewDetails(row.original)}
          >
            <Info className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  const filteredData = submissions.filter(
    (submission) =>
      submission.submission_id
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      submission.contractor_id
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      (submission.PO_id &&
        submission.PO_id?.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (submission.CWO_id &&
        submission.CWO_id?.toLowerCase().includes(searchTerm.toLowerCase())) ||
      submission.payment_currency
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      submission.invoice_currency
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-8">
      <div className="mb-8 flex justify-between items-center">
        <h1 className="text-2xl font-semibold">Submissions</h1>
        <div className="flex gap-2">
          <div className="relative">
            <input
              type="file"
              accept=".csv"
              onChange={handleFileUpload}
              className="hidden"
              id="csv-upload"
            />
            <Button
              variant="outline"
              onClick={() => document.getElementById("csv-upload")?.click()}
            >
              <Upload className="mr-2 h-4 w-4" />
              Upload CSV
            </Button>
          </div>
          <Button onClick={handleAddClick}>
            <Plus className="mr-2 h-4 w-4" />
            Add Submission
          </Button>
        </div>
      </div>

      <div className="mb-6 flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
          <Input
            className="pl-10"
            placeholder="Search submissions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <DataTable
        columns={columns}
        data={filteredData}
        loading={isLoading}
        pageSize={10}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              submission and related validation rules and reviews.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Add/Edit Form Dialog */}
      {isFormDialogOpen && (
        <SubmissionForm
          submissionId={selectedSubmissionId || undefined}
          open={isFormDialogOpen}
          onClose={handleFormClose}
          onSuccess={handleFormSuccess}
        />
      )}

      {/* Details Dialog */}
      {viewDetailsOpen && selectedSubmission && (
        <SubmissionDetails
          submission={selectedSubmission}
          open={viewDetailsOpen}
          onClose={() => setViewDetailsOpen(false)}
        />
      )}

      {/* CSV Preview Dialog */}
      <CSVPreviewDialog
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        data={csvData}
        fileName={csvFileName}
        onConfirm={handleConfirmCsvUpload}
        validationErrors={validationErrors}
      />
    </div>
  );
}
