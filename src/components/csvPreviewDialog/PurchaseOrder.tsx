import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, AlertTriangle, Check, X } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { DataTable } from "@/components/dataTable/DataTable";
import { ColumnDef } from "@tanstack/react-table";
import { PurchaseOrder } from "@/types/Orders";
import { Badge } from "@/components/ui/badge";

interface CSVPreviewDialogProps {
  isOpen: boolean;
  onClose: () => void;
  data: Partial<PurchaseOrder>[];
  fileName: string;
  onConfirm: () => Promise<void>;
  validationErrors?: { row: number; error: string }[];
}

export function CSVPreviewDialog({
  isOpen,
  onClose,
  data,
  fileName,
  onConfirm,
  validationErrors = [],
}: CSVPreviewDialogProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadComplete, setUploadComplete] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const hasErrors = validationErrors.length > 0;

  const columns: ColumnDef<Partial<PurchaseOrder>>[] = [
    {
      id: "index",
      header: "#",
      cell: ({ row }) => <span>{row.index + 1}</span>,
      size: 50,
    },
    {
      accessorKey: "contract_id",
      header: "Contract ID",
      cell: ({ row }) => (
        <div className="font-mono text-xs">{row.getValue("contract_id")}</div>
      ),
    },
    {
      accessorKey: "PO_start_date",
      header: "Start Date",
      cell: ({ row }) => {
        const date = row.getValue("PO_start_date");
        return date ? (
          <div>{new Date(date as string).toLocaleDateString()}</div>
        ) : (
          <div>-</div>
        );
      },
    },
    {
      accessorKey: "PO_end_date",
      header: "End Date",
      cell: ({ row }) => {
        const date = row.getValue("PO_end_date");
        return date ? (
          <div>{new Date(date as string).toLocaleDateString()}</div>
        ) : (
          <div>-</div>
        );
      },
    },
    {
      accessorKey: "PO_total_value",
      header: "Total Value",
      cell: ({ row }) => {
        const value = row.getValue("PO_total_value");
        return value ? (
          <div>
            {new Intl.NumberFormat("en-US", {
              style: "currency",
              currency: "USD",
            }).format(value as number)}
          </div>
        ) : (
          <div>-</div>
        );
      },
    },
    {
      accessorKey: "PO_status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.getValue("PO_status") as string;
        if (!status) return <div>-</div>;

        const colorMap: Record<string, string> = {
          active: "bg-green-500",
          expired: "bg-gray-500",
          cancelled: "bg-red-500",
        };

        return (
          <Badge
            className={`${colorMap[status] || "bg-blue-500"} hover:${
              colorMap[status] || "bg-blue-500"
            }`}
          >
            {status}
          </Badge>
        );
      },
    },
    {
      accessorKey: "kintec_email_for_remittance",
      header: "Remittance Email",
      cell: ({ row }) => (
        <div className="truncate max-w-[200px]">
          {row.getValue("kintec_email_for_remittance") || "-"}
        </div>
      ),
    },
    {
      id: "status",
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
    },
  ];

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
          <DialogTitle>Purchase Order CSV Preview: {fileName}</DialogTitle>
          <DialogDescription>
            Review the purchase orders before importing. Make sure all required
            fields are present.
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
                  Successfully imported {data.length} purchase orders.
                </AlertDescription>
              </Alert>
            )}

            {isUploading && (
              <div className="mb-4 space-y-2 flex-shrink-0">
                <div className="flex justify-between text-sm text-gray-500">
                  <span>Uploading {data.length} purchase orders...</span>
                  <span>{Math.round(uploadProgress)}%</span>
                </div>
                <Progress value={uploadProgress} className="h-2" />
              </div>
            )}

            <div className="m-4 flex-shrink-0">
              <p className="text-sm text-muted-foreground mb-2">
                Preview of {data.length} purchase order records
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
