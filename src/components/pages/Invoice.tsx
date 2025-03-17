"use client";

import { useState } from "react";
import {
  useInvoices,
  useDeleteInvoice,
  useCreateInvoice,
  useSearchFilter,
  useParseInvoiceCsv,
} from "@/hooks/useInvoices";
import { DataTable } from "@/components/dataTable/DataTable";
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Plus, Search, Pencil, Trash2, Upload, Info } from "lucide-react";
import { Input } from "@/components/ui/input";
import { InvoiceForm } from "@/components/forms/Invoice";
import { Badge } from "@/components/ui/badge";
import { InvoiceView, InvoiceStatus, InvoiceType } from "@/types/Invoice";
import { toast } from "sonner";
import { CSVPreviewDialog } from "@/components/reusableModels/CSVPreviewDialog";
import { DeleteConfirmationDialog } from "@/components/reusableModels/DeleteConfirmationDialog";
import {
  DetailsDialog,
  DetailSection,
} from "@/components/reusableModels/DetailsDialog";
import { format } from "date-fns";

export function Invoice() {
  // Core data fetching hook
  const { data: invoices = [], isLoading, refetch } = useInvoices();
  const deleteInvoice = useDeleteInvoice();
  const createInvoice = useCreateInvoice();
  const parseCSV = useParseInvoiceCsv();

  // Page-level state management
  const [searchTerm, setSearchTerm] = useState("");

  // Form dialog state
  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<
    string | undefined
  >();

  // Details dialog state
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [selectedInvoiceForDetails, setSelectedInvoiceForDetails] = useState<
    InvoiceView | undefined
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
  const [invoiceToDelete, setInvoiceToDelete] = useState<string | null>(null);

  // Filter data based on search term
  const filteredData = useSearchFilter<InvoiceView>(invoices, searchTerm, [
    "invoice_id",
    "invoice_currency",
    "invoice_status",
    "invoice_type",
  ]);

  // Simple handlers for UI actions
  const handleAddClick = () => {
    setSelectedInvoiceId(undefined);
    setIsFormDialogOpen(true);
  };

  const handleEditClick = (invoiceId: string) => {
    setSelectedInvoiceId(invoiceId);
    setIsFormDialogOpen(true);
  };

  const handleDetailsClick = (invoice: InvoiceView) => {
    setSelectedInvoiceForDetails(invoice);
    setIsDetailsDialogOpen(true);
  };

  const handleDeleteClick = (invoiceId: string) => {
    setInvoiceToDelete(invoiceId);
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
      await createInvoice.mutateAsync(csvData);
      toast.success(`Successfully imported ${csvData.length} invoices`);
      refetch();
      setIsCSVDialogOpen(false);

      setCsvData([]);
      setCsvValidationErrors([]);
      setUploadFile(null);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      toast.error(`Failed to import invoices: ${errorMessage}`);
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

  const formatDate = (date: Date) => {
    return format(new Date(date), "PP");
  };

  const formatCurrency = (value: any, currency: string) => {
    return `${currency} ${safelyParseNumber(value).toFixed(2)}`;
  };

  const getStatusColor = (status: InvoiceStatus) => {
    const colorMap: Record<InvoiceStatus, string> = {
      pending: "bg-amber-500 hover:bg-amber-600",
      paid: "bg-green-500 hover:bg-green-600",
    };
    return colorMap[status] || "bg-blue-500 hover:bg-blue-600";
  };

  // Generate detail sections for the Invoice
  const getInvoiceDetailSections = (): DetailSection[] => {
    if (!selectedInvoiceForDetails) return [];

    return [
      {
        title: "Invoice Information",
        items: [
          { label: "Invoice ID", value: selectedInvoiceForDetails.invoice_id },
          {
            label: "Billing Period",
            value: formatDate(selectedInvoiceForDetails.billing_period),
          },
          {
            label: "Status",
            value: (
              <Badge
                className={getStatusColor(
                  selectedInvoiceForDetails.invoice_status as InvoiceStatus
                )}
              >
                {selectedInvoiceForDetails.invoice_status}
              </Badge>
            ),
          },
          { label: "Type", value: selectedInvoiceForDetails.invoice_type },
          {
            label: "Total Value",
            value: formatCurrency(
              selectedInvoiceForDetails.invoice_total_value,
              selectedInvoiceForDetails.invoice_currency
            ),
          },
          {
            label: "Currency",
            value: selectedInvoiceForDetails.invoice_currency,
          },
          {
            label: "Withholding Tax",
            value: selectedInvoiceForDetails.wht_applicable
              ? `${selectedInvoiceForDetails.wht_rate}%`
              : "Not Applicable",
          },
          {
            label: "External Assignment",
            value: selectedInvoiceForDetails.external_assignment ? "Yes" : "No",
          },
        ],
      },
      ...(selectedInvoiceForDetails.purchase_order
        ? [
            {
              title: "Related Purchase Order",
              items: [
                {
                  label: "PO ID",
                  value: selectedInvoiceForDetails.purchase_order.PO_id,
                },
                {
                  label: "PO Status",
                  value: selectedInvoiceForDetails.purchase_order.PO_status,
                },
                {
                  label: "Contract",
                  value:
                    selectedInvoiceForDetails.purchase_order.contract_id ||
                    "N/A",
                },
              ],
            },
          ]
        : []),
      ...(selectedInvoiceForDetails.calloff_work_order
        ? [
            {
              title: "Related Call-off Work Order",
              items: [
                {
                  label: "CWO ID",
                  value: selectedInvoiceForDetails.calloff_work_order.CWO_id,
                },
                {
                  label: "CWO Status",
                  value:
                    selectedInvoiceForDetails.calloff_work_order.CWO_status,
                },
                {
                  label: "Contract",
                  value: "N/A",
                },
              ],
            },
          ]
        : []),
    ];
  };

  const columns: ColumnDef<InvoiceView>[] = [
    {
      accessorKey: "invoice_id",
      header: "Invoice ID",
      cell: ({ row }) => (
        <div className="font-mono text-xs truncate max-w-[120px] md:max-w-none">
          {row.getValue("invoice_id")}
        </div>
      ),
    },
    {
      accessorKey: "billing_period",
      header: "Billing Period",
      cell: ({ row }) => {
        return <div>{formatDate(row.getValue("billing_period"))}</div>;
      },
    },
    {
      accessorKey: "invoice_status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.getValue("invoice_status") as InvoiceStatus;
        return (
          <Badge className={getStatusColor(status)}>
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </Badge>
        );
      },
    },
    {
      accessorKey: "invoice_type",
      header: "Type",
      cell: ({ row }) => {
        const type = row.getValue("invoice_type") as string;
        return <div className="capitalize">{type}</div>;
      },
    },
    {
      accessorKey: "invoice_total_value",
      header: "Total Value",
      cell: ({ row }) => {
        const value = row.getValue("invoice_total_value");
        const currency = row.original.invoice_currency;
        return (
          <div className="font-mono">{formatCurrency(value, currency)}</div>
        );
      },
    },
    {
      id: "relatedTo",
      header: "Related To",
      cell: ({ row }) => {
        if (row.original.purchase_order) {
          return <div>PO: {row.original.purchase_order.PO_id}</div>;
        }
        if (row.original.calloff_work_order) {
          return <div>CWO: {row.original.calloff_work_order.CWO_id}</div>;
        }
        return <div>-</div>;
      },
    },
    {
      accessorKey: "wht_applicable",
      header: "WHT",
      cell: ({ row }) => {
        const whtApplicable = row.getValue("wht_applicable") as boolean;
        const whtRate = row.original.wht_rate;

        if (whtApplicable && whtRate !== undefined && whtRate !== null) {
          return <div>{whtRate}%</div>;
        }

        return <div>N/A</div>;
      },
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        return (
          <div className="flex justify-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleEditClick(row.original.invoice_id)}
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleDeleteClick(row.original.invoice_id)}
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
      <h1 className="text-xl sm:text-2xl font-semibold">Invoice Management</h1>
      <div className="flex flex-wrap justify-between items-center gap-2">
        <div className="relative flex flex-1 items-center gap-2">
          <Button
            size="sm"
            className="w-full sm:w-auto"
            onClick={handleAddClick}
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Invoice
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
            placeholder="Search invoices..."
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
      <InvoiceForm
        invoiceId={selectedInvoiceId}
        open={isFormDialogOpen}
        onClose={() => setIsFormDialogOpen(false)}
        onSuccess={handleFormSuccess}
      />

      {/* Details Dialog */}
      {selectedInvoiceForDetails && (
        <DetailsDialog
          title={`Invoice: ${selectedInvoiceForDetails.invoice_id}`}
          open={isDetailsDialogOpen}
          onClose={() => setIsDetailsDialogOpen(false)}
          sections={getInvoiceDetailSections()}
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
          title="Import Invoices"
          description="Review invoice data before import"
        />
      )}

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmationDialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onDelete={deleteInvoice.mutateAsync}
        itemId={invoiceToDelete}
        title="Delete Invoice"
        description="Are you sure you want to delete this invoice? This action cannot be undone."
        successMessage="Invoice deleted successfully"
        errorMessage="Failed to delete invoice"
      />
    </div>
  );
}
