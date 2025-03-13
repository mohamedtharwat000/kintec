import React, { useState, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, AlertTriangle, Check, X } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { DataTable } from "@/components/dataTable/DataTable";
import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { ReviewStatus, OverallValidationStatus } from "@/types/Review";

interface CSVPreviewDialogProps {
  isOpen: boolean;
  onClose: () => void;
  data: any[];
  fileName: string;
  onConfirm: () => Promise<void>;
  validationErrors?: { row: number; error: string }[];
  title?: string;
}

export function CSVPreviewDialog({
  isOpen,
  onClose,
  data,
  fileName,
  onConfirm,
  validationErrors = [],
  title = "Preview Review CSV Data",
}: CSVPreviewDialogProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadComplete, setUploadComplete] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const hasErrors = validationErrors.length > 0;

  // Get all unique headers from objects
  const headers =
    data.length > 0
      ? Array.from(new Set(data.flatMap((obj) => Object.keys(obj))))
      : [];

  // Function to get appropriate badge for status
  const getStatusBadge = (status: string) => {
    if (!status) return <span>N/A</span>;

    switch (status.toLowerCase()) {
      case ReviewStatus.approved:
        return <Badge className="bg-green-500">Approved</Badge>;
      case ReviewStatus.rejected:
        return <Badge className="bg-red-500">Rejected</Badge>;
      case ReviewStatus.pending:
      default:
        return <Badge className="bg-yellow-500">Pending</Badge>;
    }
  };

  // Create columns dynamically from headers
  const columns = useMemo(() => {
    const cols: ColumnDef<any>[] = [
      {
        id: "index",
        header: "#",
        cell: ({ row }) => <span>{row.index + 1}</span>,
        size: 50,
      },
      ...(headers.includes("submission_id")
        ? [
            {
              id: "submission_id",
              accessorKey: "submission_id",
              header: "Submission ID",
              cell: ({ row }: { row: any }) => (
                <div className="w-36 font-mono text-xs">
                  {row.original.submission_id}
                </div>
              ),
            },
          ]
        : []),
      ...(headers.includes("reviewer_name")
        ? [
            {
              id: "reviewer_name",
              accessorKey: "reviewer_name",
              header: "Reviewer",
              cell: ({ row }: { row: any }) => (
                <div className="w-32 truncate">
                  {row.original.reviewer_name || "N/A"}
                </div>
              ),
            },
          ]
        : []),
      ...(headers.includes("review_status")
        ? [
            {
              id: "review_status",
              accessorKey: "review_status",
              header: "Status",
              cell: ({ row }: { row: any }) => (
                <div className="w-24">
                  {getStatusBadge(row.original.review_status)}
                </div>
              ),
            },
          ]
        : []),
      ...(headers.includes("review_timestamp")
        ? [
            {
              id: "review_timestamp",
              accessorKey: "review_timestamp",
              header: "Review Date",
              cell: ({ row }: { row: any }) => (
                <div className="w-28">
                  {row.original.review_timestamp
                    ? format(
                        new Date(row.original.review_timestamp),
                        "dd/MM/yyyy"
                      )
                    : "N/A"}
                </div>
              ),
            },
          ]
        : []),
      ...(headers.includes("special_review_required")
        ? [
            {
              id: "special_review_required",
              accessorKey: "special_review_required",
              header: "Special Review",
              cell: ({ row }: { row: any }) => (
                <div className="w-28">
                  {typeof row.original.special_review_required === "boolean"
                    ? row.original.special_review_required
                      ? "Yes"
                      : "No"
                    : "N/A"}
                </div>
              ),
            },
          ]
        : []),
      {
        id: "validation_status",
        header: "Validation",
        cell: ({ row }) => {
          const rowErrors = validationErrors.filter(
            (e) => e.row === row.index + 1
          );
          return rowErrors.length > 0 ? (
            <div className="flex items-center">
              <AlertTriangle className="h-4 w-4 text-amber-500 mr-1" />
              <span className="text-xs text-amber-700">Error</span>
            </div>
          ) : (
            <div className="flex items-center">
              <Check className="h-4 w-4 text-green-500 mr-1" />
              <span className="text-xs text-green-700">Valid</span>
            </div>
          );
        },
        size: 100,
      },
    ];
    return cols;
  }, [headers, validationErrors]);

  const handleConfirm = async () => {
    setIsUploading(true);
    setUploadProgress(0);
    setUploadError(null);

    try {
      // Simulate progress
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          const newProgress = prev + Math.random() * 15;
          return newProgress >= 90 ? 90 : newProgress;
        });
      }, 300);

      await onConfirm();

      clearInterval(progressInterval);
      setUploadProgress(100);
      setUploadComplete(true);

      // Auto close after success
      setTimeout(() => {
        onClose();
        setIsUploading(false);
        setUploadComplete(false);
      }, 1500);
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : "Upload failed");
      setUploadProgress(0);
      setIsUploading(false);
    }
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => !open && !isUploading && onClose()}
    >
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle>
            {title}: {fileName}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground text-sm">
            Please review the review data before importing. Ensure all required
            fields are present and correctly formatted.
          </DialogDescription>
        </DialogHeader>
        <div className="flex-grow overflow-auto">
          <div className="flex flex-col flex-grow overflow-hidden">
            {hasErrors && (
              <Alert variant="destructive" className="mb-4 flex-shrink-0">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Validation Errors</AlertTitle>
                <AlertDescription>
                  Please fix these errors in your CSV file before uploading.
                </AlertDescription>
              </Alert>
            )}

            {validationErrors.length > 0 && (
              <div className="mt-4 bg-amber-50 p-3 rounded-md border border-amber-200 max-h-[150px] overflow-auto flex-shrink-0">
                <h4 className="font-medium text-amber-800 mb-2">
                  Validation Issues:
                </h4>
                <ul className="list-disc pl-5 text-sm text-amber-700 space-y-1">
                  {validationErrors.map((error, index) => (
                    <li key={index}>
                      Row {error.row}: {error.error}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {uploadError && (
              <Alert variant="destructive" className="mb-4 flex-shrink-0">
                <X className="h-4 w-4" />
                <AlertTitle>Upload Failed</AlertTitle>
                <AlertDescription>{uploadError}</AlertDescription>
              </Alert>
            )}

            {uploadComplete && (
              <Alert className="mb-4 bg-green-50 border-green-500 text-green-800 flex-shrink-0">
                <Check className="h-4 w-4 text-green-600" />
                <AlertTitle>Upload Successful</AlertTitle>
                <AlertDescription>
                  Successfully imported {data.length} review records.
                </AlertDescription>
              </Alert>
            )}

            {isUploading && (
              <div className="mb-4 space-y-2 flex-shrink-0">
                <div className="flex justify-between text-sm text-gray-500">
                  <span>Uploading {data.length} review records...</span>
                  <span>{Math.round(uploadProgress)}%</span>
                </div>
                <Progress value={uploadProgress} className="h-2" />
              </div>
            )}

            <div className="m-4 flex-shrink-0">
              <p className="text-sm text-muted-foreground mb-2">
                Preview of {data.length} review records
              </p>
            </div>

            <DataTable
              columns={columns}
              data={data}
              pageSize={5}
              loading={isUploading}
            />
          </div>
        </div>

        <DialogFooter className="flex-shrink-0 mt-4 border-t pt-4">
          <Button variant="outline" onClick={onClose} disabled={isUploading}>
            Cancel
          </Button>
          <Button onClick={handleConfirm} disabled={isUploading || hasErrors}>
            {isUploading ? "Uploading..." : "Confirm Upload"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
