"use client";

import { useState } from "react";
import {
  usePurchaseOrders,
  useDeletePurchaseOrder,
  useCreatePurchaseOrder,
  useSearchFilter,
  useParsePurchaseOrderCsv,
} from "@/hooks/usePurchaseOrders";
import { DataTable } from "@/components/dataTable/DataTable";
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Plus, Search, Pencil, Trash2, Upload, Info } from "lucide-react";
import { Input } from "@/components/ui/input";
import { PurchaseOrderForm } from "@/components/forms/PurchaseOrder";
import { Badge } from "@/components/ui/badge";
import { PurchaseOrderView, PO_Status } from "@/types/PurchaseOrder";
import { toast } from "sonner";
import { CSVPreviewDialog } from "@/components/reusableModels/CSVPreviewDialog";
import { DeleteConfirmationDialog } from "@/components/reusableModels/DeleteConfirmationDialog";
import {
  DetailsDialog,
  DetailSection,
} from "@/components/reusableModels/DetailsDialog";
import { format } from "date-fns";

export function PurchaseOrder() {
  // Core data fetching hook
  const { data: purchaseOrders = [], isLoading, refetch } = usePurchaseOrders();
  const deletePurchaseOrder = useDeletePurchaseOrder();
  const createPurchaseOrder = useCreatePurchaseOrder();
  const parseCSV = useParsePurchaseOrderCsv();

  // Page-level state management
  const [searchTerm, setSearchTerm] = useState("");

  // Form dialog state
  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
  const [selectedPOId, setSelectedPOId] = useState<string | undefined>(
    undefined
  );

  // Details dialog state
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [selectedPOForDetails, setSelectedPOForDetails] = useState<
    PurchaseOrderView | undefined
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
  const [poToDelete, setPoToDelete] = useState<string | null>(null);

  // Filter data based on search term
  const filteredData = useSearchFilter<PurchaseOrderView>(
    purchaseOrders,
    searchTerm,
    ["PO_id", "contract_id", "PO_status", "kintec_email_for_remittance"]
  );

  // Simple handlers for UI actions
  const handleAddClick = () => {
    setSelectedPOId(undefined);
    setIsFormDialogOpen(true);
  };

  const handleEditClick = (poId: string) => {
    setSelectedPOId(poId);
    setIsFormDialogOpen(true);
  };

  const handleDetailsClick = (po: PurchaseOrderView) => {
    setSelectedPOForDetails(po);
    setIsDetailsDialogOpen(true);
  };

  const handleDeleteClick = (poId: string) => {
    setPoToDelete(poId);
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
      await createPurchaseOrder.mutateAsync(csvData);
      toast.success(`Successfully imported ${csvData.length} purchase orders`);
      refetch();
      setIsCSVDialogOpen(false);
      setCsvData([]);
      setCsvValidationErrors([]);
      setUploadFile(null);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      toast.error(`Failed to import purchase orders: ${errorMessage}`);
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

  // Generate detail sections for the PO
  const getPODetailSections = (): DetailSection[] => {
    if (!selectedPOForDetails) return [];

    const formatDate = (date: Date) => format(new Date(date), "PPP");
    const formatCurrency = (value: any) =>
      new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
      }).format(safelyParseNumber(value));

    return [
      {
        title: "Purchase Order Information",
        items: [
          { label: "PO ID", value: selectedPOForDetails.PO_id },
          { label: "Contract ID", value: selectedPOForDetails.contract_id },
          {
            label: "Start Date",
            value: formatDate(selectedPOForDetails.PO_start_date),
          },
          {
            label: "End Date",
            value: formatDate(selectedPOForDetails.PO_end_date),
          },
          {
            label: "Total Value",
            value: formatCurrency(selectedPOForDetails.PO_total_value),
          },
          {
            label: "Status",
            value: (
              <Badge
                className={getStatusColor(
                  selectedPOForDetails.PO_status as PO_Status
                )}
              >
                {selectedPOForDetails.PO_status}
              </Badge>
            ),
          },
          {
            label: "Remittance Email",
            value: (
              <a
                href={`mailto:${selectedPOForDetails.kintec_email_for_remittance}`}
                className="text-blue-600 hover:underline"
              >
                {selectedPOForDetails.kintec_email_for_remittance}
              </a>
            ),
          },
        ],
      },
      ...(selectedPOForDetails.contract
        ? [
            {
              title: "Related Contract",
              items: [
                {
                  label: "Job Title",
                  value: selectedPOForDetails.contract.job_title,
                },
                {
                  label: "Job Number",
                  value: selectedPOForDetails.contract.job_number,
                },
                {
                  label: "Job Type",
                  value: selectedPOForDetails.contract.job_type,
                },
                {
                  label: "Contract Status",
                  value: (
                    <Badge>
                      {selectedPOForDetails.contract.contract_status}
                    </Badge>
                  ),
                },
              ],
            },
          ]
        : []),
    ];
  };

  const formatDate = (date: Date) => {
    return format(new Date(date), "PP");
  };

  const formatCurrency = (value: any) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(safelyParseNumber(value));
  };

  const getStatusColor = (status: PO_Status) => {
    const colorMap: Record<PO_Status, string> = {
      active: "bg-green-500 hover:bg-green-600",
      expired: "bg-gray-500 hover:bg-gray-600",
      cancelled: "bg-red-500 hover:bg-red-600",
    };
    return colorMap[status] || "bg-blue-500 hover:bg-blue-600";
  };

  const columns: ColumnDef<PurchaseOrderView>[] = [
    {
      accessorKey: "PO_id",
      header: "PO ID",
      cell: ({ row }) => (
        <div className="font-medium truncate max-w-[120px] md:max-w-none">
          {row.getValue("PO_id")}
        </div>
      ),
    },
    {
      accessorKey: "contract_id",
      header: "Contract ID",
      cell: ({ row }) => (
        <div className="truncate max-w-[120px] md:max-w-none">
          {row.getValue("contract_id")}
        </div>
      ),
    },
    {
      accessorKey: "contract",
      header: "Job Title",
      cell: ({ row }) => {
        const contract = row.original.contract;
        return (
          <div className="truncate max-w-[150px] md:max-w-none">
            {contract ? contract.job_title : "N/A"}
          </div>
        );
      },
    },
    {
      accessorKey: "PO_status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.getValue("PO_status") as PO_Status;
        return (
          <Badge className={getStatusColor(status)}>
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </Badge>
        );
      },
    },
    {
      accessorKey: "PO_total_value",
      header: "Total Value",
      cell: ({ row }) => {
        const value = row.original.PO_total_value;
        return <div>{formatCurrency(value)}</div>;
      },
    },
    {
      accessorKey: "PO_start_date",
      header: "Start Date",
      cell: ({ row }) => {
        return <div>{formatDate(row.getValue("PO_start_date"))}</div>;
      },
    },
    {
      accessorKey: "PO_end_date",
      header: "End Date",
      cell: ({ row }) => {
        return <div>{formatDate(row.getValue("PO_end_date"))}</div>;
      },
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        return (
          <div className="flex justify-center gap-2">
            {/* <Button
              variant="ghost"
              size="icon"
              onClick={() => handleEditClick(row.original.PO_id)}
            >
              <Pencil className="h-4 w-4" />
            </Button> */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleDeleteClick(row.original.PO_id)}
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
      <h1 className="text-xl sm:text-2xl font-semibold">Purchase Orders</h1>
      <div className="flex flex-wrap justify-between items-center gap-2">
        <div className="relative flex flex-1 items-center gap-2">
          <Button
            size="sm"
            className="w-full sm:w-auto"
            onClick={handleAddClick}
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Purchase Order
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
            placeholder="Search purchase orders..."
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
      <PurchaseOrderForm
        poId={selectedPOId}
        open={isFormDialogOpen}
        onClose={() => setIsFormDialogOpen(false)}
        onSuccess={handleFormSuccess}
      />

      {/* Details Dialog */}
      {selectedPOForDetails && (
        <DetailsDialog
          title={`Purchase Order: ${selectedPOForDetails.PO_id}`}
          open={isDetailsDialogOpen}
          onClose={() => setIsDetailsDialogOpen(false)}
          sections={getPODetailSections()}
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
          title="Import Purchase Orders"
          description="Review purchase order data before import"
        />
      )}

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmationDialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onDelete={deletePurchaseOrder.mutateAsync}
        itemId={poToDelete}
        title="Delete Purchase Order"
        description="Are you sure you want to delete this purchase order? This action cannot be undone."
        successMessage="Purchase order deleted successfully"
        errorMessage="Failed to delete purchase order"
      />
    </div>
  );
}
