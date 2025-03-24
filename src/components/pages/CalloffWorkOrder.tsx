"use client";

import { useState } from "react";
import {
  useCalloffWorkOrders,
  useDeleteCalloffWorkOrder,
  useCreateCalloffWorkOrder,
  useSearchFilter,
  useParseCalloffWorkOrderCsv,
} from "@/hooks/useCalloffWorkOrders";
import { DataTable } from "@/components/dataTable/DataTable";
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Plus, Search, Pencil, Trash2, Upload, Info } from "lucide-react";
import { Input } from "@/components/ui/input";
import { CalloffWorkOrderForm } from "@/components/forms/CalloffWorkOrder";
import { Badge } from "@/components/ui/badge";
import { CalloffWorkOrderView, PO_Status } from "@/types/CalloffWorkOrder";
import { toast } from "sonner";
import { CSVPreviewDialog } from "@/components/reusableModels/CSVPreviewDialog";
import { DeleteConfirmationDialog } from "@/components/reusableModels/DeleteConfirmationDialog";
import {
  DetailsDialog,
  DetailSection,
} from "@/components/reusableModels/DetailsDialog";
import { format } from "date-fns";

export function CalloffWorkOrder() {
  // Core data fetching hook
  const {
    data: calloffWorkOrders = [],
    isLoading,
    refetch,
  } = useCalloffWorkOrders();
  const deleteCalloffWorkOrder = useDeleteCalloffWorkOrder();
  const createCalloffWorkOrder = useCreateCalloffWorkOrder();
  const parseCSV = useParseCalloffWorkOrderCsv();

  // Page-level state management
  const [searchTerm, setSearchTerm] = useState("");

  // Form dialog state
  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
  const [selectedCWOId, setSelectedCWOId] = useState<string | undefined>();

  // Details dialog state
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [selectedCWOForDetails, setSelectedCWOForDetails] = useState<
    CalloffWorkOrderView | undefined
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
  const [cwoToDelete, setCwoToDelete] = useState<string | null>(null);

  // Filter data based on search term
  const filteredData = useSearchFilter<CalloffWorkOrderView>(
    calloffWorkOrders,
    searchTerm,
    ["CWO_id", "contract_id", "CWO_status", "kintec_email_for_remittance"]
  );

  // Simple handlers for UI actions
  const handleAddClick = () => {
    setSelectedCWOId(undefined);
    setIsFormDialogOpen(true);
  };

  const handleEditClick = (cwoId: string) => {
    setSelectedCWOId(cwoId);
    setIsFormDialogOpen(true);
  };

  const handleDetailsClick = (cwo: CalloffWorkOrderView) => {
    setSelectedCWOForDetails(cwo);
    setIsDetailsDialogOpen(true);
  };

  const handleDeleteClick = (cwoId: string) => {
    setCwoToDelete(cwoId);
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
      await createCalloffWorkOrder.mutateAsync(csvData);
      toast.success(
        `Successfully imported ${csvData.length} call-off work orders`
      );
      refetch();
      setIsCSVDialogOpen(false);

      setCsvData([]);
      setCsvValidationErrors([]);
      setUploadFile(null);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      toast.error(`Failed to import call-off work orders: ${errorMessage}`);
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

  // Generate detail sections for the CWO
  const getCWODetailSections = (): DetailSection[] => {
    if (!selectedCWOForDetails) return [];

    const formatDate = (date: Date) => format(new Date(date), "PPP");
    const formatCurrency = (value: any) =>
      new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
      }).format(safelyParseNumber(value));

    return [
      {
        title: "Call-off Work Order Information",
        items: [
          { label: "CWO ID", value: selectedCWOForDetails.CWO_id },
          { label: "Contract ID", value: selectedCWOForDetails.contract_id },
          {
            label: "Start Date",
            value: formatDate(selectedCWOForDetails.CWO_start_date),
          },
          {
            label: "End Date",
            value: formatDate(selectedCWOForDetails.CWO_end_date),
          },
          {
            label: "Total Value",
            value: formatCurrency(selectedCWOForDetails.CWO_total_value),
          },
          {
            label: "Status",
            value: (
              <Badge
                className={getStatusColor(
                  selectedCWOForDetails.CWO_status as PO_Status
                )}
              >
                {selectedCWOForDetails.CWO_status}
              </Badge>
            ),
          },
          {
            label: "Remittance Email",
            value: (
              <a
                href={`mailto:${selectedCWOForDetails.kintec_email_for_remittance}`}
                className="text-blue-600 hover:underline"
              >
                {selectedCWOForDetails.kintec_email_for_remittance}
              </a>
            ),
          },
        ],
      },
      ...(selectedCWOForDetails.contract
        ? [
            {
              title: "Related Contract",
              items: [
                {
                  label: "Job Title",
                  value: selectedCWOForDetails.contract.job_title,
                },
                {
                  label: "Job Number",
                  value: selectedCWOForDetails.contract.job_number,
                },
                {
                  label: "Job Type",
                  value: selectedCWOForDetails.contract.job_type,
                },
                {
                  label: "Contract Status",
                  value: (
                    <Badge>
                      {selectedCWOForDetails.contract.contract_status}
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

  const columns: ColumnDef<CalloffWorkOrderView>[] = [
    {
      accessorKey: "CWO_id",
      header: "CWO ID",
      cell: ({ row }) => (
        <div className="font-medium truncate max-w-[120px] md:max-w-none">
          {row.getValue("CWO_id")}
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
      accessorKey: "CWO_status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.getValue("CWO_status") as PO_Status;
        return (
          <Badge className={getStatusColor(status)}>
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </Badge>
        );
      },
    },
    {
      accessorKey: "CWO_total_value",
      header: "Total Value",
      cell: ({ row }) => {
        const value = row.original.CWO_total_value;
        return <div>{formatCurrency(value)}</div>;
      },
    },
    {
      accessorKey: "CWO_start_date",
      header: "Start Date",
      cell: ({ row }) => {
        return <div>{formatDate(row.getValue("CWO_start_date"))}</div>;
      },
    },
    {
      accessorKey: "CWO_end_date",
      header: "End Date",
      cell: ({ row }) => {
        return <div>{formatDate(row.getValue("CWO_end_date"))}</div>;
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
              onClick={() => handleEditClick(row.original.CWO_id)}
            >
              <Pencil className="h-4 w-4" />
            </Button> */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleDeleteClick(row.original.CWO_id)}
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
      <h1 className="text-xl sm:text-2xl font-semibold">
        Call-off Work Orders
      </h1>
      <div className="flex flex-wrap justify-between items-center gap-2">
        <div className="relative flex flex-1 items-center gap-2">
          <Button
            size="sm"
            className="w-full sm:w-auto"
            onClick={handleAddClick}
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Call-off Work Order
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
            placeholder="Search call-off work orders..."
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
      <CalloffWorkOrderForm
        cwoId={selectedCWOId}
        open={isFormDialogOpen}
        onClose={() => setIsFormDialogOpen(false)}
        onSuccess={handleFormSuccess}
      />

      {/* Details Dialog */}
      {selectedCWOForDetails && (
        <DetailsDialog
          title={`Call-off Work Order: ${selectedCWOForDetails.CWO_id}`}
          open={isDetailsDialogOpen}
          onClose={() => setIsDetailsDialogOpen(false)}
          sections={getCWODetailSections()}
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
          title="Import Call-off Work Orders"
          description="Review call-off work order data before import"
        />
      )}

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmationDialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onDelete={deleteCalloffWorkOrder.mutateAsync}
        itemId={cwoToDelete}
        title="Delete Call-off Work Order"
        description="Are you sure you want to delete this call-off work order? This action cannot be undone."
        successMessage="Call-off work order deleted successfully"
        errorMessage="Failed to delete call-off work order"
      />
    </div>
  );
}
