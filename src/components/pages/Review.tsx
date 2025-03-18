"use client";

import { useState } from "react";
import {
  useReviews,
  useDeleteReview,
  useCreateReview,
  useSearchFilter,
  useParseReviewCsv,
} from "@/hooks/useReviews";
import { DataTable } from "@/components/dataTable/DataTable";
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Plus, Search, Pencil, Trash2, Upload, Info } from "lucide-react";
import { Input } from "@/components/ui/input";
import { ReviewForm } from "@/components/forms/ReviewForm";
import { Badge } from "@/components/ui/badge";
import { Review as ReviewType, ReviewStatus } from "@/types/Review";
import { toast } from "sonner";
import { CSVPreviewDialog } from "@/components/reusableModels/CSVPreviewDialog";
import { DeleteConfirmationDialog } from "@/components/reusableModels/DeleteConfirmationDialog";
import {
  DetailsDialog,
  DetailSection,
} from "@/components/reusableModels/DetailsDialog";
import { format } from "date-fns";

export function Review() {
  // Core data fetching hook
  const { data: reviews = [], isLoading, refetch } = useReviews();
  const deleteReview = useDeleteReview();
  const createReview = useCreateReview();
  const parseCSV = useParseReviewCsv();

  // Page-level state management
  const [searchTerm, setSearchTerm] = useState("");

  // Form dialog state
  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
  const [selectedReviewId, setSelectedReviewId] = useState<string | undefined>(
    undefined
  );

  // Details dialog state
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [selectedReviewForDetails, setSelectedReviewForDetails] = useState<
    ReviewType | undefined
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
  const [reviewToDelete, setReviewToDelete] = useState<string | null>(null);

  // Filter data based on search term
  const filteredData = useSearchFilter<ReviewType>(reviews, searchTerm, [
    "submission_id",
    "reviewer_name",
    "review_status",
  ]);

  // Simple handlers for UI actions
  const handleAddClick = () => {
    setSelectedReviewId(undefined);
    setIsFormDialogOpen(true);
  };

  const handleEditClick = (reviewId: string) => {
    setSelectedReviewId(reviewId);
    setIsFormDialogOpen(true);
  };

  const handleDetailsClick = (review: ReviewType) => {
    setSelectedReviewForDetails(review);
    setIsDetailsDialogOpen(true);
  };

  const handleDeleteClick = (reviewId: string) => {
    setReviewToDelete(reviewId);
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
      await createReview.mutateAsync(csvData);
      toast.success(`Successfully imported ${csvData.length} reviews`);
      refetch();
      setIsCSVDialogOpen(false);
      setCsvData([]);
      setCsvValidationErrors([]);
      setUploadFile(null);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      toast.error(`Failed to import reviews: ${errorMessage}`);
    }
  };

  const handleFormSuccess = () => {
    refetch();
    setIsFormDialogOpen(false);
  };

  const formatDate = (date: Date) => {
    return format(new Date(date), "PP");
  };

  // Get status badge with appropriate styling
  const getStatusBadge = (status: ReviewStatus) => {
    const colorMap: Record<ReviewStatus, string> = {
      pending: "bg-yellow-500 hover:bg-yellow-600",
      approved: "bg-green-500 hover:bg-green-600",
      rejected: "bg-red-500 hover:bg-red-600",
    };

    return (
      <Badge className={colorMap[status] || "bg-gray-500"}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  // Generate detail sections for the review
  const getReviewDetailSections = (): DetailSection[] => {
    if (!selectedReviewForDetails) return [];

    return [
      {
        title: "Review Information",
        items: [
          { label: "Review ID", value: selectedReviewForDetails.review_id },
          {
            label: "Submission ID",
            value: selectedReviewForDetails.submission_id,
          },
          {
            label: "Reviewer Name",
            value: selectedReviewForDetails.reviewer_name,
          },
          {
            label: "Status",
            value: getStatusBadge(
              selectedReviewForDetails.review_status as ReviewStatus
            ),
          },
          {
            label: "Review Date",
            value: formatDate(
              new Date(selectedReviewForDetails.review_timestamp)
            ),
          },
          {
            label: "Special Review Required",
            value: selectedReviewForDetails.special_review_required
              ? "Yes"
              : "No",
          },
        ],
      },
      {
        title: "Validation Details",
        items: [
          {
            label: "Overall Validation Status",
            value: (
              <Badge
                className={
                  selectedReviewForDetails.overall_validation_status ===
                  "approved"
                    ? "bg-green-500"
                    : "bg-red-500"
                }
              >
                {selectedReviewForDetails.overall_validation_status}
              </Badge>
            ),
          },
          {
            label: "Last Validation Date",
            value: formatDate(
              new Date(selectedReviewForDetails.last_overall_validation_date)
            ),
          },
          {
            label: "Updated By",
            value: selectedReviewForDetails.updated_by,
          },
        ],
      },
      ...(selectedReviewForDetails.review_rejection_reason
        ? [
            {
              title: "Rejection Details",
              items: [
                {
                  label: "Rejection Reason",
                  value:
                    selectedReviewForDetails.review_rejection_reason as string,
                  colSpan: 2 as const,
                },
              ],
            },
          ]
        : []),
      ...(selectedReviewForDetails.notes
        ? [
            {
              title: "Additional Notes",
              items: [
                {
                  label: "Notes",
                  value: selectedReviewForDetails.notes as string,
                  colSpan: 2 as const,
                },
              ],
            },
          ]
        : []),
    ];
  };

  const columns: ColumnDef<ReviewType>[] = [
    {
      accessorKey: "submission_id",
      header: () => <div>Submission ID</div>,
      cell: ({ row }) => (
        <div className="font-mono text-xs truncate max-w-[120px] md:max-w-none">
          {row.getValue("submission_id")}
        </div>
      ),
    },
    {
      accessorKey: "reviewer_name",
      header: () => <div>Reviewer</div>,
      cell: ({ row }) => (
        <div className="truncate max-w-[120px] md:max-w-none">
          {row.getValue("reviewer_name")}
        </div>
      ),
    },
    {
      accessorKey: "review_status",
      header: () => <div>Status</div>,
      cell: ({ row }) => getStatusBadge(row.getValue("review_status")),
    },
    {
      accessorKey: "review_timestamp",
      header: () => <div>Review Date</div>,
      cell: ({ row }) => (
        <div>{formatDate(new Date(row.getValue("review_timestamp")))}</div>
      ),
    },
    {
      accessorKey: "special_review_required",
      header: () => <div>Special Review</div>,
      cell: ({ row }) => (
        <div>{row.getValue("special_review_required") ? "Yes" : "No"}</div>
      ),
    },
    {
      id: "actions",
      header: () => <div>Actions</div>,
      cell: ({ row }) => {
        return (
          <div className="flex justify-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleEditClick(row.original.review_id)}
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleDeleteClick(row.original.review_id)}
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
      <h1 className="text-xl sm:text-2xl font-semibold">Review Management</h1>
      <div className="flex flex-wrap justify-between items-center gap-2">
        <div className="relative flex flex-1 items-center gap-2">
          <Button
            size="sm"
            className="w-full sm:w-auto"
            onClick={handleAddClick}
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Review
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
            placeholder="Search reviews..."
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
      <ReviewForm
        reviewId={selectedReviewId}
        open={isFormDialogOpen}
        onClose={() => setIsFormDialogOpen(false)}
        onSuccess={handleFormSuccess}
      />

      {/* Details Dialog */}
      {selectedReviewForDetails && (
        <DetailsDialog
          title={`Review: ${selectedReviewForDetails.review_id}`}
          open={isDetailsDialogOpen}
          onClose={() => setIsDetailsDialogOpen(false)}
          sections={getReviewDetailSections()}
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
          title="Import Reviews"
          description="Review data before import"
        />
      )}

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmationDialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onDelete={deleteReview.mutateAsync}
        itemId={reviewToDelete}
        title="Delete Review"
        description="Are you sure you want to delete this review? This action cannot be undone."
        successMessage="Review deleted successfully"
        errorMessage="Failed to delete review"
      />
    </div>
  );
}
