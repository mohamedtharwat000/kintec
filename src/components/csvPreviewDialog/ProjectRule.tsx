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
import { DataTable } from "@/components/dataTable/DataTable";
import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { tryCatch } from "@/lib/utils";
import { toast } from "sonner";

interface CSVPreviewDialogProps {
  isOpen: boolean;
  onClose: () => void;
  data: any[];
  fileName: string;
  onConfirm: () => Promise<void>;
  validationErrors?: { row: number; error: string }[];
  title?: string;
  projectNameMap?: Record<string, string>;
}

export function CSVPreviewDialog({
  isOpen,
  onClose,
  data,
  fileName,
  onConfirm,
  validationErrors = [],
  title = "Preview Project Rules CSV Data",
  projectNameMap = {},
}: CSVPreviewDialogProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadComplete, setUploadComplete] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const hasErrors = validationErrors.length > 0;

  // Get all unique headers from objects
  const headers =
    data.length > 0
      ? Array.from(new Set(data.flatMap((obj) => Object.keys(obj))))
      : [];

  // Create columns dynamically from headers
  const columns = useMemo(() => {
    const cols: ColumnDef<any>[] = [
      {
        id: "index",
        header: "#",
        cell: ({ row }) => <span>{row.index + 1}</span>,
        size: 50,
      },
      ...(headers.includes("project_id")
        ? [
            {
              id: "project_id",
              accessorKey: "project_id",
              header: "Project",
              cell: ({ row }: { row: any }) => (
                <div className="w-44">
                  {projectNameMap[row.original.project_id] ||
                    row.original.project_id}
                </div>
              ),
            },
          ]
        : []),
      ...(headers.includes("project_rules_reviewer_name")
        ? [
            {
              id: "project_rules_reviewer_name",
              accessorKey: "project_rules_reviewer_name",
              header: "Reviewer",
              cell: ({ row }: { row: any }) => (
                <div className="w-40">
                  {row.original.project_rules_reviewer_name || "Not assigned"}
                </div>
              ),
            },
          ]
        : []),
      ...(headers.includes("special_project_rules")
        ? [
            {
              id: "special_project_rules",
              accessorKey: "special_project_rules",
              header: "Special Rules",
              cell: ({ row }: { row: any }) => (
                <div className="w-40 truncate">
                  {row.original.special_project_rules || "None"}
                </div>
              ),
            },
          ]
        : []),
      ...(headers.includes("additional_review_process")
        ? [
            {
              id: "additional_review_process",
              accessorKey: "additional_review_process",
              header: "Add. Review",
              cell: ({ row }: { row: any }) => (
                <Badge
                  variant={
                    row.original.additional_review_process === "required"
                      ? "default"
                      : "outline"
                  }
                >
                  {row.original.additional_review_process || "Not specified"}
                </Badge>
              ),
            },
          ]
        : []),
      ...(headers.includes("major_project_indicator")
        ? [
            {
              id: "major_project_indicator",
              accessorKey: "major_project_indicator",
              header: "Major Project",
              cell: ({ row }: { row: any }) => {
                const value =
                  typeof row.original.major_project_indicator === "string"
                    ? row.original.major_project_indicator.toUpperCase() ===
                      "TRUE"
                    : row.original.major_project_indicator;

                return (
                  <Badge variant={value ? "default" : "outline"}>
                    {value ? "Yes" : "No"}
                  </Badge>
                );
              },
            },
          ]
        : []),
      {
        id: "status",
        header: "Status",
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
  }, [headers, validationErrors, projectNameMap]);

  const handleConfirm = async () => {
    // Don't allow upload if there are validation errors
    if (hasErrors) {
      toast.error("Please fix validation errors before uploading");
      return;
    }

    setUploadComplete(false);
    setIsUploading(true);
    setUploadError(null);

    const { error } = await tryCatch(async () => {
      await onConfirm();
    });

    if (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Upload failed";
      setUploadError(errorMessage);
      setIsUploading(false);
      toast.error(`Upload failed: ${errorMessage}`);
    } else {
      setIsUploading(false);
      setUploadComplete(true);
      toast.success(`Successfully uploaded ${data.length} records`);
      onClose();
    }
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!isUploading && !open) {
          onClose();
        }
      }}
    >
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle>
            {title}: {fileName}
          </DialogTitle>
          <DialogDescription>
            {hasErrors
              ? `Found ${validationErrors.length} validation issues. Please fix before uploading.`
              : `Ready to upload ${data.length} records.`}
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
                  Successfully imported {data.length} records.
                </AlertDescription>
              </Alert>
            )}

            {isUploading && (
              <div className="mb-4 flex-shrink-0">
                <div className="flex justify-center">
                  <div
                    className="inline-block h-6 w-6 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em]"
                    role="status"
                  >
                    <span className="sr-only">Loading...</span>
                  </div>
                </div>
              </div>
            )}

            <div className="mb-4 flex-shrink-0">
              <p className="text-sm text-muted-foreground mb-2">
                Preview of {data.length} project rule records
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
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isUploading}
            className="min-w-[100px]"
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={isUploading || hasErrors}
            className="min-w-[150px]"
          >
            {isUploading ? (
              <>
                <span className="mr-2 inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></span>
                Uploading...
              </>
            ) : hasErrors ? (
              "Fix Errors to Upload"
            ) : (
              "Confirm Upload"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
