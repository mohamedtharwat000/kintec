import React, { useState } from "react";
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
import { AlertCircle, AlertTriangle, Check, Loader2, X } from "lucide-react";
import { DataTable } from "@/components/dataTable/DataTable";
import { ColumnDef } from "@tanstack/react-table";

interface CSVPreviewDialogProps<T> {
  isOpen: boolean;
  onClose: () => void;
  data: T[];
  fileName: string;
  onConfirm: () => Promise<void>;
  validationErrors?: { row: number; error: string }[];
  title?: string;
  description?: string;
  columns?: ColumnDef<T>[];
}

export function CSVPreviewDialog<T>({
  isOpen,
  onClose,
  data,
  fileName,
  onConfirm,
  validationErrors = [],
  title = "Preview CSV Data",
  description,
  columns,
}: CSVPreviewDialogProps<T>) {
  const [isUploading, setIsUploading] = useState(false);

  const hasErrors = validationErrors.length > 0;

  const generatedColumns = React.useMemo(() => {
    if (columns) return columns;

    if (data.length === 0) return [] as ColumnDef<T>[];

    const headers = Array.from(
      new Set(data.flatMap((obj) => Object.keys(obj as Record<string, any>)))
    );

    return [
      {
        id: "index",
        header: "#",
        cell: ({ row }) => <span>{row.index + 1}</span>,
        size: 50,
      },
      ...headers.map((header) => ({
        id: header,
        accessorKey: header,
        header,
        cell: ({ row }: { row: any }) => (
          <div className="w-32 truncate">{row.original[header]}</div>
        ),
      })),
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
    ] as ColumnDef<T>[];
  }, [data, columns, validationErrors]);

  const handleConfirmUpload = async () => {
    setIsUploading(true);

    try {
      await onConfirm();
      setIsUploading(false);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Upload failed";
      setIsUploading(false);
    }
  };

  const handleCloseDialog = () => {
    if (!isUploading) {
      onClose();
    }
  };

  if (data.length === 0 && isOpen) {
    return (
      <Dialog open={isOpen} onOpenChange={handleCloseDialog}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            <DialogDescription>
              No data to preview. Please select a CSV file.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={handleCloseDialog}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!isUploading && !open) {
          handleCloseDialog();
        }
      }}
    >
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle>
            {title}: {fileName}
          </DialogTitle>
          <DialogDescription>
            {description ||
              (hasErrors
                ? `Found ${validationErrors.length} validation issues. Please fix before uploading.`
                : `Ready to upload ${data.length} records.`)}
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

            <div className="mb-4 flex-shrink-0">
              <p className="text-sm text-muted-foreground mb-2">
                Preview of {data.length} records
              </p>
            </div>

            <DataTable
              columns={generatedColumns}
              data={data}
              pageSize={5}
              loading={isUploading}
            />
          </div>
        </div>

        <DialogFooter className="flex-shrink-0 mt-4 border-t pt-4">
          <Button
            variant="outline"
            onClick={handleCloseDialog}
            disabled={isUploading}
            className="min-w-[100px]"
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirmUpload}
            disabled={isUploading || hasErrors}
            className="min-w-[150px]"
          >
            {isUploading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
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
