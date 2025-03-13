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
}

export function CSVPreviewDialog({
  isOpen,
  onClose,
  data,
  fileName,
  onConfirm,
  validationErrors = [],
  title = "Preview Bank Details CSV Data",
}: CSVPreviewDialogProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadComplete, setUploadComplete] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const hasErrors = validationErrors.length > 0;

  const headers =
    data.length > 0
      ? Array.from(new Set(data.flatMap((obj) => Object.keys(obj))))
      : [];

  const columns = useMemo(() => {
    const cols: ColumnDef<any>[] = [
      {
        id: "index",
        header: "#",
        cell: ({ row }) => <span>{row.index + 1}</span>,
        size: 50,
      },
      ...(headers.includes("contractor_id")
        ? [
            {
              id: "contractor_id",
              accessorKey: "contractor_id",
              header: "Contractor ID",
              cell: ({ row }: { row: any }) => (
                <div className="w-44 font-mono text-xs">
                  {row.original.contractor_id}
                </div>
              ),
            },
          ]
        : []),
      ...(headers.includes("bank_name")
        ? [
            {
              id: "bank_name",
              accessorKey: "bank_name",
              header: "Bank Name",
              cell: ({ row }: { row: any }) => (
                <div className="w-40 truncate">{row.original.bank_name}</div>
              ),
            },
          ]
        : []),
      ...(headers.includes("account_number")
        ? [
            {
              id: "account_number",
              accessorKey: "account_number",
              header: "Account Number",
              cell: ({ row }: { row: any }) => (
                <div className="w-32 font-mono text-xs">
                  {row.original.account_number}
                </div>
              ),
            },
          ]
        : []),
      ...(headers.includes("IBAN")
        ? [
            {
              id: "IBAN",
              accessorKey: "IBAN",
              header: "IBAN",
              cell: ({ row }: { row: any }) => (
                <div className="w-44 font-mono text-xs truncate">
                  {row.original.IBAN}
                </div>
              ),
            },
          ]
        : []),
      ...(headers.includes("SWIFT")
        ? [
            {
              id: "SWIFT",
              accessorKey: "SWIFT",
              header: "SWIFT",
              cell: ({ row }: { row: any }) => (
                <div className="w-28 font-mono text-xs">
                  {row.original.SWIFT}
                </div>
              ),
            },
          ]
        : []),
      ...(headers.includes("currency")
        ? [
            {
              id: "currency",
              accessorKey: "currency",
              header: "Currency",
              cell: ({ row }: { row: any }) => (
                <div className="w-24">{row.original.currency}</div>
              ),
            },
          ]
        : []),
      ...(headers.includes("bank_detail_type")
        ? [
            {
              id: "bank_detail_type",
              accessorKey: "bank_detail_type",
              header: "Type",
              cell: ({ row }: { row: any }) => (
                <div className="w-24 capitalize">
                  {row.original.bank_detail_type}
                </div>
              ),
            },
          ]
        : []),
      ...(headers.includes("bank_detail_validated")
        ? [
            {
              id: "bank_detail_validated",
              accessorKey: "bank_detail_validated",
              header: "Validated",
              cell: ({ row }: { row: any }) => (
                <div className="w-24">
                  {row.original.bank_detail_validated === true ||
                  row.original.bank_detail_validated === "TRUE"
                    ? "Yes"
                    : "No"}
                </div>
              ),
            },
          ]
        : []),
      {
        id: "status",
        header: "Status",
        cell: ({ row }) => {
          const rowErrors = validationErrors.filter(
            (e) => e.row === row.index + 2
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
      toast.success(`Successfully uploaded ${data.length} bank detail records`);
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
              : `Ready to upload ${data.length} bank detail records.`}
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
                  Successfully imported {data.length} bank detail records.
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
                Preview of {data.length} bank detail records
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
