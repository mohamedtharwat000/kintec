"use client";

import { useState } from "react";
import {
  useReviews,
  useDeleteReview,
  useCreateReview,
} from "@/hooks/useReviews";
import { DataTable } from "@/components/dataTable/DataTable";
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Plus, Search, Pencil, Trash2, Upload, Info } from "lucide-react";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Review as ReviewType, ReviewStatus } from "@/types/Review";
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
import { ReviewForm } from "@/components/forms/ReviewForm";
import { ReviewDetails } from "@/components/detailsDialogs/ReviewDetails";
import { CSVPreviewDialog } from "@/components/csvPreviewDialog/Review";
import { parseReview } from "@/lib/csv/review";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";

export function Review() {
  const { data: reviews = [], isLoading } = useReviews();
  const deleteReview = useDeleteReview();
  const createReview = useCreateReview();

  const [searchTerm, setSearchTerm] = useState("");
  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
  const [selectedReviewId, setSelectedReviewId] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [reviewToDelete, setReviewToDelete] = useState<string | null>(null);
  const [viewDetailsOpen, setViewDetailsOpen] = useState(false);
  const [selectedReview, setSelectedReview] = useState<ReviewType | null>(null);

  // CSV upload state
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [csvData, setCsvData] = useState<any[]>([]);
  const [csvDataToUpload, setCsvDataToUpload] = useState<any[]>([]);
  const [csvFileName, setCsvFileName] = useState("");
  const [validationErrors, setValidationErrors] = useState<
    { row: number; error: string }[]
  >([]);

  const handleAddClick = () => {
    setSelectedReviewId(null);
    setIsFormDialogOpen(true);
  };

  const handleEditClick = (reviewId: string) => {
    setSelectedReviewId(reviewId);
    setIsFormDialogOpen(true);
  };

  const handleViewDetails = (review: ReviewType) => {
    setSelectedReview(review);
    setViewDetailsOpen(true);
  };

  const handleDeleteClick = (reviewId: string) => {
    setReviewToDelete(reviewId);
    setDeleteDialogOpen(true);
  };

  const handleFormClose = () => {
    setIsFormDialogOpen(false);
  };

  const handleFormSuccess = () => {
    // The form itself will handle success actions
  };

  const handleConfirmDelete = async () => {
    if (!reviewToDelete) return;

    try {
      await deleteReview.mutateAsync(reviewToDelete);
      toast.success("Review deleted successfully");
    } catch (error) {
      toast.error("Failed to delete review");
    } finally {
      setDeleteDialogOpen(false);
      setReviewToDelete(null);
    }
  };

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      // Parse CSV file using the dedicated parser
      const result = await parseReview(file);

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
        csvDataToUpload.map((review) => createReview.mutateAsync(review))
      );

      toast.success(`Successfully imported ${csvDataToUpload.length} reviews`);
      setCsvData([]);
      setCsvDataToUpload([]);
      setCsvFileName("");
      return Promise.resolve();
    } catch (error) {
      console.error("Error importing CSV data:", error);
      toast.error("Failed to import reviews from CSV");
      return Promise.reject(error);
    }
  };

  const getStatusBadge = (status: ReviewStatus) => {
    switch (status) {
      case ReviewStatus.approved:
        return <Badge className="bg-green-500">Approved</Badge>;
      case ReviewStatus.rejected:
        return <Badge className="bg-red-500">Rejected</Badge>;
      case ReviewStatus.pending:
      default:
        return <Badge className="bg-yellow-500">Pending</Badge>;
    }
  };

  const columns: ColumnDef<ReviewType>[] = [
    {
      accessorKey: "review_id",
      header: "ID",
      cell: ({ row }) => (
        <div className="font-mono text-xs w-32 truncate">
          {row.getValue("review_id")}
        </div>
      ),
    },
    {
      accessorKey: "submission_id",
      header: "Submission ID",
      cell: ({ row }) => (
        <div className="font-mono text-xs w-32 truncate">
          {row.getValue("submission_id")}
        </div>
      ),
    },
    {
      accessorKey: "reviewer_name",
      header: "Reviewer",
      cell: ({ row }) => (
        <div className="w-32 truncate">{row.getValue("reviewer_name")}</div>
      ),
    },
    {
      accessorKey: "review_status",
      header: "Status",
      cell: ({ row }) => getStatusBadge(row.getValue("review_status")),
    },
    {
      accessorKey: "review_timestamp",
      header: "Review Date",
      cell: ({ row }) => {
        const date = row.getValue<Date>("review_timestamp");
        return (
          <div className="w-28 truncate">
            {format(new Date(date), "dd MMM yyyy")}
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
            onClick={() => handleViewDetails(row.original)}
          >
            <Info className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  const filteredData = reviews.filter(
    (review) =>
      review.review_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      review.submission_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      review.reviewer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      review.review_status?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      review.updated_by?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-8">
      <div className="mb-8 flex justify-between items-center">
        <h1 className="text-2xl font-semibold">Reviews</h1>
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
            Add Review
          </Button>
        </div>
      </div>

      <div className="mb-6 flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
          <Input
            className="pl-10"
            placeholder="Search reviews..."
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
              This action cannot be undone. This will permanently delete this
              review.
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
        <ReviewForm
          reviewId={selectedReviewId || undefined}
          open={isFormDialogOpen}
          onClose={handleFormClose}
          onSuccess={handleFormSuccess}
        />
      )}

      {/* Details Dialog */}
      {viewDetailsOpen && selectedReview && (
        <ReviewDetails
          review={selectedReview}
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
