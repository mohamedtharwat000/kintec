"use client";

import { useState } from "react";
import {
  useCalloffWorkOrders,
  useDeleteCalloffWorkOrder,
  useCreateCalloffWorkOrder,
} from "@/hooks/useCalloffWorkOrders";
import { DataTable } from "@/components/dataTable/DataTable";
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Plus, Search, Pencil, Trash2, Upload, Info } from "lucide-react";
import { Input } from "@/components/ui/input";
import { CalloffWorkOrderForm } from "@/components/forms/CalloffWorkOrder";
import { Badge } from "@/components/ui/badge";
import type { CalloffWorkOrder as CalloffWorkOrderType } from "@/types/Orders";
import { toast } from "sonner";
import { parseCalloffWorkOrder } from "@/lib/csv/calloffWorkOrder";
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
import { CalloffWorkOrderDetails } from "@/components/detailsDialogs/CalloffWorkOrder";
import { CSVPreviewDialog } from "@/components/csvPreviewDialog/CalloffWorkOrder";

export function CalloffWorkOrder() {
  const { data: calloffWorkOrders = [], isLoading } = useCalloffWorkOrders();
  const deleteCalloffWorkOrder = useDeleteCalloffWorkOrder();
  const createCalloffWorkOrder = useCreateCalloffWorkOrder();

  const [searchTerm, setSearchTerm] = useState("");
  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
  const [selectedCWOId, setSelectedCWOId] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [cwoToDelete, setCwoToDelete] = useState<string | null>(null);
  const [viewDetailsOpen, setViewDetailsOpen] = useState(false);
  const [selectedCWO, setSelectedCWO] = useState<CalloffWorkOrderType | null>(
    null
  );

  // CSV upload state
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [csvData, setCsvData] = useState<Partial<CalloffWorkOrderType>[]>([]);
  const [csvFileName, setCsvFileName] = useState("");
  const [validationErrors, setValidationErrors] = useState<
    { row: number; error: string }[]
  >([]);

  const handleAddClick = () => {
    setSelectedCWOId(null);
    setIsFormDialogOpen(true);
  };

  const handleEditClick = (cwoId: string) => {
    setSelectedCWOId(cwoId);
    setIsFormDialogOpen(true);
  };

  const handleViewDetails = (cwo: CalloffWorkOrderType) => {
    setSelectedCWO(cwo);
    setViewDetailsOpen(true);
  };

  const handleDeleteClick = (cwoId: string) => {
    setCwoToDelete(cwoId);
    setDeleteDialogOpen(true);
  };

  const handleFormClose = () => {
    setIsFormDialogOpen(false);
  };

  const handleFormSuccess = () => {
    setIsFormDialogOpen(false);
  };

  const handleConfirmDelete = async () => {
    if (!cwoToDelete) return;

    try {
      await deleteCalloffWorkOrder.mutateAsync(cwoToDelete);
      toast.success("Call-off Work Order deleted successfully");
    } catch (error) {
      toast.error("Failed to delete Call-off Work Order");
    } finally {
      setDeleteDialogOpen(false);
      setCwoToDelete(null);
    }
  };

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const result = await parseCalloffWorkOrder(file);
      setCsvFileName(file.name);
      setCsvData(result.data);

      // Validate data
      const errors: { row: number; error: string }[] = [];
      result.data.forEach((item, index) => {
        if (!item.contract_id) {
          errors.push({ row: index + 1, error: "Contract ID is required" });
        }
        if (!item.CWO_start_date) {
          errors.push({ row: index + 1, error: "Start Date is required" });
        }
        if (!item.CWO_end_date) {
          errors.push({ row: index + 1, error: "End Date is required" });
        }
        if (!item.CWO_total_value) {
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
      // Process each call-off work order one by one
      for (const cwo of csvData) {
        await createCalloffWorkOrder.mutateAsync(cwo as any);
      }

      toast.success(
        `Successfully imported ${csvData.length} call-off work orders`
      );
      return Promise.resolve();
    } catch (error) {
      console.error("Error importing CSV data:", error);
      toast.error("Failed to import call-off work orders from CSV");
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

  const columns: ColumnDef<CalloffWorkOrderType>[] = [
    {
      accessorKey: "CWO_id",
      header: "CWO ID",
      cell: ({ row }) => (
        <div className="font-mono text-xs">{row.getValue("CWO_id")}</div>
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
      accessorKey: "CWO_status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.getValue("CWO_status") as string;
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
      accessorKey: "CWO_total_value",
      header: "Total Value",
      cell: ({ row }) => {
        return <div>{formatCurrency(row.getValue("CWO_total_value"))}</div>;
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
            onClick={() => handleEditClick(row.original.CWO_id)}
          >
            <Pencil className="h-4 w-4" />
          </Button>
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
            onClick={() => handleViewDetails(row.original)}
          >
            <Info className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  const filteredData = calloffWorkOrders.filter(
    (cwo) =>
      cwo.CWO_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (cwo.contract?.job_title || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      cwo.CWO_status.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cwo.kintec_email_for_remittance
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-8">
      <div className="mb-8 flex justify-between items-center">
        <h1 className="text-2xl font-semibold">
          Call-off Work Order Management
        </h1>
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
            Add Call-off Work Order
          </Button>
        </div>
      </div>

      <div className="mb-6 flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
          <Input
            className="pl-10"
            placeholder="Search call-off work orders..."
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
      <CalloffWorkOrderForm
        cwoId={selectedCWOId || undefined}
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
              call-off work order and may affect related records.
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
      {viewDetailsOpen && selectedCWO && (
        <CalloffWorkOrderDetails
          calloffWorkOrder={selectedCWO}
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
