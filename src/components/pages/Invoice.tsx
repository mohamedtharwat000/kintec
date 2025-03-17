"use client";

import { useState } from "react";
import {
  useInvoices,
  useDeleteInvoice,
  useCreateInvoice,
} from "@/hooks/useInvoices";
import { DataTable } from "@/components/dataTable/DataTable";
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Plus, Search, Pencil, Trash2, Upload } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import type { Invoice as InvoiceType } from "@/types/Invoice";
import { toast } from "sonner";
import { parseInvoice } from "@/lib/csv/invoice";
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
import { CSVPreviewDialog } from "@/components/csvPreviewDialog/Invoice";
import { InvoiceDetails } from "@/components/000/Invoice";
import { InvoiceForm } from "@/components/forms/Invoice";

export function Invoice() {
  const { data: invoices = [], isLoading } = useInvoices();
  const deleteInvoice = useDeleteInvoice();
  const createInvoice = useCreateInvoice();

  const [searchTerm, setSearchTerm] = useState("");
  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string | null>(
    null
  );
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [invoiceToDelete, setInvoiceToDelete] = useState<string | null>(null);

  // CSV upload state
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [csvData, setCsvData] = useState<Partial<InvoiceType>[]>([]);
  const [csvFileName, setCsvFileName] = useState("");
  const [validationErrors, setValidationErrors] = useState<
    { row: number; error: string }[]
  >([]);

  const handleAddClick = () => {
    setSelectedInvoiceId(null);
    setIsFormDialogOpen(true);
  };

  const handleEditClick = (invoiceId: string) => {
    setSelectedInvoiceId(invoiceId);
    setIsFormDialogOpen(true);
  };

  const handleDeleteClick = (invoiceId: string) => {
    setInvoiceToDelete(invoiceId);
    setDeleteDialogOpen(true);
  };

  const handleFormClose = () => {
    setIsFormDialogOpen(false);
  };

  const handleFormSuccess = () => {
    setIsFormDialogOpen(false);
  };

  const handleConfirmDelete = async () => {
    if (!invoiceToDelete) return;

    try {
      await deleteInvoice.mutateAsync(invoiceToDelete);
      toast.success("Invoice deleted successfully");
    } catch (error) {
      toast.error("Failed to delete invoice");
    } finally {
      setDeleteDialogOpen(false);
      setInvoiceToDelete(null);
    }
  };

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const result = await parseInvoice(file);
      setCsvFileName(file.name);
      setCsvData(result.data);

      // Validate data
      const errors: { row: number; error: string }[] = [];
      result.data.forEach((item, index) => {
        if (!item.billing_period) {
          errors.push({ row: index + 1, error: "Billing period is required" });
        }
        if (!item.invoice_status) {
          errors.push({ row: index + 1, error: "Invoice status is required" });
        }
        if (!item.invoice_type) {
          errors.push({ row: index + 1, error: "Invoice type is required" });
        }
        if (!item.invoice_currency) {
          errors.push({ row: index + 1, error: "Currency is required" });
        }
        if (!item.invoice_total_value) {
          errors.push({ row: index + 1, error: "Total value is required" });
        }
        if (!item.PO_id && !item.CWO_id) {
          errors.push({
            row: index + 1,
            error: "Either PO ID or CWO ID is required",
          });
        }
        if (item.PO_id && item.CWO_id) {
          errors.push({
            row: index + 1,
            error: "Only one of PO ID or CWO ID should be provided",
          });
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
      // Process each invoice one by one
      for (const invoice of csvData) {
        await createInvoice.mutateAsync(invoice as any);
      }

      toast.success(`Successfully imported ${csvData.length} invoices`);
      return Promise.resolve();
    } catch (error) {
      console.error("Error importing CSV data:", error);
      toast.error("Failed to import invoices from CSV");
      return Promise.reject(error);
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const columns: ColumnDef<InvoiceType>[] = [
    {
      accessorKey: "invoice_id",
      header: "ID",
      cell: ({ row }) => (
        <div className="font-mono text-xs">{row.getValue("invoice_id")}</div>
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
        const status = row.getValue("invoice_status") as string;
        const colorMap: Record<string, string> = {
          pending: "bg-amber-500",
          paid: "bg-green-500",
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
          <div className="font-mono">
            {currency} {parseFloat(value as string).toFixed(2)}
          </div>
        );
      },
    },
    {
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
      cell: ({ row }) => (
        <div className="flex space-x-2">
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
          <InvoiceDetails invoice={row.original} />
        </div>
      ),
    },
  ];

  const filteredData = invoices.filter(
    (invoice) =>
      invoice.invoice_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.invoice_currency
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      (invoice.purchase_order?.PO_id || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      (invoice.calloff_work_order?.CWO_id || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-8">
      <div className="mb-8 flex justify-between items-center">
        <h1 className="text-2xl font-semibold">Invoice Management</h1>
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
            Add Invoice
          </Button>
        </div>
      </div>

      <div className="mb-6 flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
          <Input
            className="pl-10"
            placeholder="Search invoices..."
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
      <InvoiceForm
        invoiceId={selectedInvoiceId || undefined}
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
              invoice and may affect related records.
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
