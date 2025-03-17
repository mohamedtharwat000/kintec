"use client";

import { useState } from "react";
import {
  useRates,
  useDeleteRate,
  useCreateRate,
  useSearchFilter,
  useParseRateCsv,
} from "@/hooks/useRates";
import { DataTable } from "@/components/dataTable/DataTable";
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Plus, Search, Pencil, Trash2, Upload, Info } from "lucide-react";
import { Input } from "@/components/ui/input";
import { RateForm } from "@/components/forms/Rate";
import { Badge } from "@/components/ui/badge";
import { RateView, RateType, RateFrequency } from "@/types/Rate";
import { toast } from "sonner";
import { CSVPreviewDialog } from "@/components/reusableModels/CSVPreviewDialog";
import { DeleteConfirmationDialog } from "@/components/reusableModels/DeleteConfirmationDialog";
import {
  DetailsDialog,
  DetailSection,
} from "@/components/reusableModels/DetailsDialog";

export function Rate() {
  // Core data fetching hook
  const { data: rates = [], isLoading, refetch } = useRates();
  const deleteRate = useDeleteRate();
  const createRate = useCreateRate();
  const parseCSV = useParseRateCsv();

  // Page-level state management
  const [searchTerm, setSearchTerm] = useState("");

  // Form dialog state
  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
  const [selectedRateId, setSelectedRateId] = useState<string>();

  // Details dialog state
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [selectedRateForDetails, setSelectedRateForDetails] = useState<
    RateView | undefined
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
  const [rateToDelete, setRateToDelete] = useState<string | null>(null);

  // Filter data based on search term
  const filteredData = useSearchFilter<RateView>(rates, searchTerm, [
    "rate_type",
    "rate_frequency",
    "rate_value",
    "rate_currency",
  ]);

  // Simple handlers for UI actions
  const handleAddClick = () => {
    setSelectedRateId(undefined);
    setIsFormDialogOpen(true);
  };

  const handleEditClick = (rateId: string) => {
    setSelectedRateId(rateId);
    setIsFormDialogOpen(true);
  };

  const handleDetailsClick = (rate: RateView) => {
    setSelectedRateForDetails(rate);
    setIsDetailsDialogOpen(true);
  };

  const handleDeleteClick = (rateId: string) => {
    setRateToDelete(rateId);
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
      await createRate.mutateAsync(csvData);
      toast.success(`Successfully imported ${csvData.length} rates`);
      refetch();
      setIsCSVDialogOpen(false);
      setCsvData([]);
      setCsvValidationErrors([]);
      setUploadFile(null);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      toast.error(`Failed to import rates: ${errorMessage}`);
    }
  };

  const handleFormSuccess = () => {
    refetch();
    setIsFormDialogOpen(false);
  };

  // Helper function to safely convert any value to a number
  const safelyParseNumber = (value: any): number => {
    if (typeof value === "number") return value;
    if (value === null || value === undefined) return 0;
    // Handle Decimal objects from Prisma
    if (
      typeof value === "object" &&
      value !== null &&
      "toNumber" in value &&
      typeof value.toNumber === "function"
    ) {
      return value.toNumber();
    }
    return Number(value) || 0;
  };

  // Format currency with value
  const formatCurrency = (value: any, currency: string) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency,
      minimumFractionDigits: 2,
    }).format(safelyParseNumber(value));
  };

  // Generate detail sections for the rate
  const getRateDetailSections = (): DetailSection[] => {
    if (!selectedRateForDetails) return [];

    return [
      {
        title: "Rate Information",
        items: [
          { label: "Rate ID", value: selectedRateForDetails.rate_id },
          {
            label: "Rate Type",
            value: selectedRateForDetails.rate_type,
          },
          {
            label: "Rate Frequency",
            value: selectedRateForDetails.rate_frequency,
          },
          {
            label: "Rate Value",
            value: formatCurrency(
              selectedRateForDetails.rate_value,
              selectedRateForDetails.rate_currency
            ),
          },
          {
            label: "Currency",
            value: selectedRateForDetails.rate_currency,
          },
        ],
      },
      ...(selectedRateForDetails.purchase_order
        ? [
            {
              title: "Purchase Order",
              items: [
                {
                  label: "PO ID",
                  value: selectedRateForDetails.purchase_order.PO_id,
                },
                {
                  label: "Total Value",
                  value: formatCurrency(
                    selectedRateForDetails.purchase_order.PO_total_value,
                    "USD"
                  ),
                },
                {
                  label: "Status",
                  value: (
                    <Badge>
                      {selectedRateForDetails.purchase_order.PO_status}
                    </Badge>
                  ),
                },
              ],
            },
          ]
        : []),
      ...(selectedRateForDetails.calloff_work_order
        ? [
            {
              title: "Call-off Work Order",
              items: [
                {
                  label: "CWO ID",
                  value: selectedRateForDetails.calloff_work_order.CWO_id,
                },
                {
                  label: "Total Value",
                  value: formatCurrency(
                    selectedRateForDetails.calloff_work_order.CWO_total_value,
                    "USD"
                  ),
                },
                {
                  label: "Status",
                  value: (
                    <Badge>
                      {selectedRateForDetails.calloff_work_order.CWO_status}
                    </Badge>
                  ),
                },
              ],
            },
          ]
        : []),
    ];
  };

  const columns: ColumnDef<RateView>[] = [
    {
      accessorKey: "rate_type",
      header: () => <div className="text-center">Rate Type</div>,
      cell: ({ row }) => {
        const type = row.getValue("rate_type") as RateType;
        return (
          <Badge
            className={`${
              type === RateType.charged ? "bg-blue-500" : "bg-green-500"
            } hover:${type === RateType.charged ? "bg-blue-600" : "bg-green-600"}`}
          >
            {type}
          </Badge>
        );
      },
    },
    {
      accessorKey: "rate_frequency",
      header: () => <div className="text-center">Frequency</div>,
      cell: ({ row }) => {
        return (
          <div className="text-center">{row.getValue("rate_frequency")}</div>
        );
      },
    },
    {
      accessorKey: "rate_value",
      header: () => <div className="text-center">Rate Value</div>,
      cell: ({ row }) => {
        const value = safelyParseNumber(row.getValue("rate_value"));
        const currency = row.original.rate_currency;
        return (
          <div className="text-right">{formatCurrency(value, currency)}</div>
        );
      },
    },
    {
      accessorKey: "PO_id",
      header: () => <div className="text-center">PO Reference</div>,
      cell: ({ row }) => {
        const poId = row.original.PO_id;
        return (
          <div className="text-center">
            {poId ? <span className="text-blue-600">{poId}</span> : "-"}
          </div>
        );
      },
    },
    {
      accessorKey: "CWO_id",
      header: () => <div className="text-center">CWO Reference</div>,
      cell: ({ row }) => {
        const cwoId = row.original.CWO_id;
        return (
          <div className="text-center">
            {cwoId ? <span className="text-green-600">{cwoId}</span> : "-"}
          </div>
        );
      },
    },
    {
      id: "actions",
      header: () => <div className="text-center">Actions</div>,
      cell: ({ row }) => (
        <div className="flex justify-center gap-2">
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
          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleDetailsClick(row.original)}
          >
            <Info className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-4 p-4">
      <h1 className="text-xl sm:text-2xl font-semibold">Rate Management</h1>
      <div className="flex flex-wrap justify-between items-center gap-2">
        <div className="relative flex flex-1 items-center gap-2">
          <Button
            size="sm"
            className="w-full sm:w-auto"
            onClick={handleAddClick}
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Rate
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
            placeholder="Search rates..."
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
      <RateForm
        rateId={selectedRateId}
        open={isFormDialogOpen}
        onClose={() => setIsFormDialogOpen(false)}
        onSuccess={handleFormSuccess}
      />

      {/* Details Dialog */}
      {selectedRateForDetails && (
        <DetailsDialog
          title={`Rate Details - ${formatCurrency(
            selectedRateForDetails.rate_value,
            selectedRateForDetails.rate_currency
          )}`}
          open={isDetailsDialogOpen}
          onClose={() => setIsDetailsDialogOpen(false)}
          sections={getRateDetailSections()}
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
          title="Import Rates"
          description="Review rate data before import"
        />
      )}

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmationDialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onDelete={deleteRate.mutateAsync}
        itemId={rateToDelete}
        title="Delete Rate"
        description="Are you sure you want to delete this rate? This action cannot be undone."
        successMessage="Rate deleted successfully"
        errorMessage="Failed to delete rate"
      />
    </div>
  );
}
