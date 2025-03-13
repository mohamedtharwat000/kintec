"use client";

import { useState } from "react";
import { useRates, useDeleteRate, useBulkCreateRates } from "@/hooks/useRates";
import { DataTable } from "@/components/dataTable/DataTable";
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Plus, Search, Pencil, Trash2, Upload } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Rate as RateInterface, RateType, RateFrequency } from "@/types/Rate";
import { toast } from "sonner";
import { parseRate } from "@/lib/csv/rate";
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
import { CSVPreviewDialog } from "@/components/csvPreviewDialog/Rate";
import { RateDetails } from "@/components/detailsDialogs/Rate";
import { RateForm } from "@/components/forms/Rate";

export function Rate() {
  const { data: rates = [], isLoading } = useRates();
  const deleteRate = useDeleteRate();
  const bulkCreateRates = useBulkCreateRates();

  const [searchTerm, setSearchTerm] = useState("");
  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
  const [selectedRateId, setSelectedRateId] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [rateToDelete, setRateToDelete] = useState<string | null>(null);

  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [csvData, setCsvData] = useState<Partial<RateInterface>[]>([]);
  const [csvFileName, setCsvFileName] = useState("");
  const [validationErrors, setValidationErrors] = useState<
    { row: number; error: string }[]
  >([]);

  const handleAddClick = () => {
    setSelectedRateId(null);
    setIsFormDialogOpen(true);
  };

  const handleEditClick = (rateId: string) => {
    setSelectedRateId(rateId);
    setIsFormDialogOpen(true);
  };

  const handleDeleteClick = (rateId: string) => {
    setRateToDelete(rateId);
    setDeleteDialogOpen(true);
  };

  const handleFormClose = () => {
    setIsFormDialogOpen(false);
  };

  const handleFormSuccess = () => {
    // The form itself will close the dialog
  };

  const handleConfirmDelete = async () => {
    if (!rateToDelete) return;

    try {
      await deleteRate.mutateAsync(rateToDelete);
      toast.success("Rate deleted successfully");
    } catch (error) {
      toast.error("Failed to delete rate");
    } finally {
      setDeleteDialogOpen(false);
      setRateToDelete(null);
    }
  };

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const result = await parseRate(file);
      setCsvFileName(file.name);
      setCsvData(result.data);

      // Validate data
      const errors: { row: number; error: string }[] = [];
      result.data.forEach((item, index) => {
        // Check if either PO_id or CWO_id is provided but not both
        if ((!item.PO_id && !item.CWO_id) || (item.PO_id && item.CWO_id)) {
          errors.push({
            row: index + 1,
            error: "Either PO_id or CWO_id must be provided, but not both",
          });
        }

        if (!item.rate_type) {
          errors.push({ row: index + 1, error: "Rate type is required" });
        } else if (
          !Object.values(RateType).includes(item.rate_type as RateType)
        ) {
          errors.push({
            row: index + 1,
            error: "Rate type must be either 'charged' or 'paid'",
          });
        }

        if (!item.rate_frequency) {
          errors.push({ row: index + 1, error: "Rate frequency is required" });
        } else if (
          !Object.values(RateFrequency).includes(
            item.rate_frequency as RateFrequency
          )
        ) {
          errors.push({
            row: index + 1,
            error: "Rate frequency must be 'hourly', 'daily', or 'monthly'",
          });
        }

        if (!item.rate_value) {
          errors.push({ row: index + 1, error: "Rate value is required" });
        } else if (isNaN(Number(item.rate_value))) {
          errors.push({ row: index + 1, error: "Rate value must be a number" });
        }

        if (!item.rate_currency) {
          errors.push({ row: index + 1, error: "Currency is required" });
        }
      });

      setValidationErrors(errors);

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
      await bulkCreateRates.mutateAsync(csvData);
      toast.success(`Successfully imported ${csvData.length} rates`);
      return Promise.resolve();
    } catch (error) {
      console.error("Error importing CSV data:", error);
      toast.error("Failed to import rates from CSV");
      return Promise.reject(error);
    }
  };

  // Format currency with value
  const formatCurrency = (value: number, currency: string) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency,
      minimumFractionDigits: 2,
    }).format(value);
  };

  const columns: ColumnDef<RateInterface>[] = [
    {
      accessorKey: "rate_type",
      header: "Rate Type",
      cell: ({ row }) => {
        const type = row.getValue("rate_type") as RateType;
        return (
          <Badge
            className={
              type === RateType.charged ? "bg-blue-500" : "bg-green-500"
            }
          >
            {type}
          </Badge>
        );
      },
    },
    {
      accessorKey: "rate_frequency",
      header: "Frequency",
      cell: ({ row }) => {
        return <div>{row.getValue("rate_frequency") as string}</div>;
      },
    },
    {
      accessorKey: "rate_value",
      header: "Rate Value",
      cell: ({ row }) => {
        const value = row.getValue("rate_value") as number;
        const currency = row.original.rate_currency;
        return <div>{formatCurrency(value, currency)}</div>;
      },
    },
    {
      accessorKey: "purchase_order",
      header: "PO Reference",
      cell: ({ row }) => {
        const po = row.original.purchase_order;
        return po ? (
          <div className="font-medium">{po.PO_id}</div>
        ) : (
          <div className="text-gray-400">N/A</div>
        );
      },
    },
    {
      accessorKey: "calloff_work_order",
      header: "CWO Reference",
      cell: ({ row }) => {
        const cwo = row.original.calloff_work_order;
        return cwo ? (
          <div className="font-medium">{cwo.CWO_id}</div>
        ) : (
          <div className="text-gray-400">N/A</div>
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
            onClick={() => handleEditClick(row.original.rate_id)}
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleDeleteClick(row.original.rate_id)}
          >
            <Trash2 className="h-4 w-4 text-red-500" />
          </Button>
          <RateDetails rate={row.original} />
        </div>
      ),
    },
  ];

  // Filter data based on search term
  const filteredData = rates.filter(
    (rate) =>
      rate.rate_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rate.rate_frequency.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rate.rate_value.toString().includes(searchTerm) ||
      rate.rate_currency.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (rate.purchase_order?.PO_id || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      (rate.calloff_work_order?.CWO_id || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-8">
      <div className="mb-8 flex justify-between items-center">
        <h1 className="text-2xl font-semibold">Rate Management</h1>
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
            Add Rate
          </Button>
        </div>
      </div>

      <div className="mb-6 flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
          <Input
            className="pl-10"
            placeholder="Search rates..."
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

      {/* Add/Edit Form Dialog */}
      <RateForm
        rateId={selectedRateId || undefined}
        open={isFormDialogOpen}
        onClose={handleFormClose}
        onSuccess={handleFormSuccess}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              rate and may affect related records.
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
