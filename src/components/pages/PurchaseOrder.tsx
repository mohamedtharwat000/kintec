"use client";

import { useState } from "react";
import {
  usePurchaseOrders,
  useDeletePurchaseOrder,
  useCreatePurchaseOrder,
} from "@/hooks/usePurchaseOrders";
import { DataTable } from "@/components/dataTable/DataTable";
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Plus, Search, Pencil, Trash2, Upload, Info } from "lucide-react";
import { Input } from "@/components/ui/input";
import { PurchaseOrderForm } from "@/components/forms/PurchaseOrder";
import { Badge } from "@/components/ui/badge";
import type { PurchaseOrder as PurchaseOrderType } from "@/types/Orders";
import { toast } from "sonner";
import { parsePurchaseOrder } from "@/lib/csv/purchaseOrder";
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
import { PurchaseOrderDetails } from "@/components/detailsDialogs/PurchaseOrder";
import { CSVPreviewDialog } from "@/components/csvPreviewDialog/PurchaseOrder";

export function PurchaseOrder() {
  const { data: purchaseOrders = [], isLoading } = usePurchaseOrders();
  const deletePurchaseOrder = useDeletePurchaseOrder();
  const createPurchaseOrder = useCreatePurchaseOrder();

  const [searchTerm, setSearchTerm] = useState("");
  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
  const [selectedPOId, setSelectedPOId] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [poToDelete, setPoToDelete] = useState<string | null>(null);
  const [viewDetailsOpen, setViewDetailsOpen] = useState(false);
  const [selectedPO, setSelectedPO] = useState<PurchaseOrderType | null>(null);

  // CSV upload state
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [csvData, setCsvData] = useState<Partial<PurchaseOrderType>[]>([]);
  const [csvFileName, setCsvFileName] = useState("");
  const [validationErrors, setValidationErrors] = useState<
    { row: number; error: string }[]
  >([]);

  const handleAddClick = () => {
    setSelectedPOId(null);
    setIsFormDialogOpen(true);
  };

  const handleEditClick = (poId: string) => {
    setSelectedPOId(poId);
    setIsFormDialogOpen(true);
  };

  const handleViewDetails = (po: PurchaseOrderType) => {
    setSelectedPO(po);
    setViewDetailsOpen(true);
  };

  const handleDeleteClick = (poId: string) => {
    setPoToDelete(poId);
    setDeleteDialogOpen(true);
  };

  const handleFormClose = () => {
    setIsFormDialogOpen(false);
  };

  const handleFormSuccess = () => {
    setIsFormDialogOpen(false);
  };

  const handleConfirmDelete = async () => {
    if (!poToDelete) return;

    try {
      await deletePurchaseOrder.mutateAsync(poToDelete);
      toast.success("Purchase Order deleted successfully");
    } catch (error) {
      toast.error("Failed to delete Purchase Order");
    } finally {
      setDeleteDialogOpen(false);
      setPoToDelete(null);
    }
  };

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const result = await parsePurchaseOrder(file);
      setCsvFileName(file.name);
      setCsvData(result.data);

      // Validate data
      const errors: { row: number; error: string }[] = [];
      result.data.forEach((item, index) => {
        if (!item.contract_id) {
          errors.push({ row: index + 1, error: "Contract ID is required" });
        }
        if (!item.PO_start_date) {
          errors.push({ row: index + 1, error: "Start Date is required" });
        }
        if (!item.PO_end_date) {
          errors.push({ row: index + 1, error: "End Date is required" });
        }
        if (!item.PO_total_value) {
          errors.push({ row: index + 1, error: "Total Value is required" });
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
      // Process each purchase order one by one
      for (const po of csvData) {
        await createPurchaseOrder.mutateAsync(po as any);
      }

      toast.success(`Successfully imported ${csvData.length} purchase orders`);
      return Promise.resolve();
    } catch (error) {
      console.error("Error importing CSV data:", error);
      toast.error("Failed to import purchase orders from CSV");
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

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(value);
  };

  const columns: ColumnDef<PurchaseOrderType>[] = [
    {
      accessorKey: "PO_id",
      header: "PO ID",
      cell: ({ row }) => (
        <div className="font-mono text-xs">{row.getValue("PO_id")}</div>
      ),
    },
    {
      accessorKey: "contract_id",
      header: "Contract",
      cell: ({ row }) => {
        const contract = row.original.contract;
        return (
          <div>
            {contract ? contract.job_title : row.getValue("contract_id")}
          </div>
        );
      },
    },
    {
      accessorKey: "PO_status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.getValue("PO_status") as string;
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
      accessorKey: "PO_total_value",
      header: "Total Value",
      cell: ({ row }) => {
        return <div>{formatCurrency(row.getValue("PO_total_value"))}</div>;
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
            onClick={() => handleEditClick(row.original.PO_id)}
          >
            <Pencil className="h-4 w-4" />
          </Button>
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
            onClick={() => handleViewDetails(row.original)}
          >
            <Info className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  const filteredData = purchaseOrders.filter(
    (po) =>
      po.PO_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (po.contract?.job_title || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      po.PO_status.toLowerCase().includes(searchTerm.toLowerCase()) ||
      po.kintec_email_for_remittance
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-8">
      <div className="mb-8 flex justify-between items-center">
        <h1 className="text-2xl font-semibold">Purchase Order Management</h1>
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
            Add Purchase Order
          </Button>
        </div>
      </div>

      <div className="mb-6 flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
          <Input
            className="pl-10"
            placeholder="Search purchase orders..."
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
      <PurchaseOrderForm
        poId={selectedPOId || undefined}
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
              purchase order and may affect related records.
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

      {/* Details Dialog */}
      {viewDetailsOpen && selectedPO && (
        <PurchaseOrderDetails
          purchaseOrder={selectedPO}
          open={viewDetailsOpen}
          onClose={() => setViewDetailsOpen(false)}
        />
      )}

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
