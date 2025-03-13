"use client";

import { useState } from "react";
import {
  useExpenses,
  useDeleteExpense,
  useCreateExpense,
} from "@/hooks/useExpenses";
import { DataTable } from "@/components/dataTable/DataTable";
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Plus, Search, Pencil, Trash2, Upload, FileText } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Expense as ExpenseType,
  ExpenseFrequency,
  ExpenseType as ExpenseTypeEnum,
} from "@/types/Expense";
import { toast } from "sonner";
import { parseExpense } from "@/lib/csv/expense";
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
import { CSVPreviewDialog } from "@/components/csvPreviewDialog/Expense";
import { ExpenseDetails } from "@/components/detailsDialogs/Expense";
import { ExpenseForm } from "@/components/forms/Expense";

export function Expense() {
  const { data: expenses = [], isLoading } = useExpenses();
  const deleteExpense = useDeleteExpense();
  const createExpense = useCreateExpense();

  const [searchTerm, setSearchTerm] = useState("");
  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
  const [selectedExpenseId, setSelectedExpenseId] = useState<string | null>(
    null
  );
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [expenseToDelete, setExpenseToDelete] = useState<string | null>(null);

  // CSV upload state
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [csvData, setCsvData] = useState<Partial<ExpenseType>[]>([]);
  const [csvFileName, setCsvFileName] = useState("");
  const [validationErrors, setValidationErrors] = useState<
    { row: number; error: string }[]
  >([]);

  const handleAddClick = () => {
    setSelectedExpenseId(null);
    setIsFormDialogOpen(true);
  };

  const handleEditClick = (expenseId: string) => {
    setSelectedExpenseId(expenseId);
    setIsFormDialogOpen(true);
  };

  const handleDeleteClick = (expenseId: string) => {
    setExpenseToDelete(expenseId);
    setDeleteDialogOpen(true);
  };

  const handleFormClose = () => {
    setIsFormDialogOpen(false);
  };

  const handleFormSuccess = () => {
    // The form itself will close the dialog
  };

  const handleConfirmDelete = async () => {
    if (!expenseToDelete) return;

    try {
      await deleteExpense.mutateAsync(expenseToDelete);
      toast.success("Expense deleted successfully");
    } catch (error) {
      toast.error("Failed to delete expense");
    } finally {
      setDeleteDialogOpen(false);
      setExpenseToDelete(null);
    }
  };

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const result = await parseExpense(file);
      setCsvFileName(file.name);
      setCsvData(result.data);

      // Validate data
      const errors: { row: number; error: string }[] = [];
      result.data.forEach((item, index) => {
        if (!item.expense_type) {
          errors.push({ row: index + 1, error: "Expense type is required" });
        }
        if (!item.expense_frequency) {
          errors.push({
            row: index + 1,
            error: "Expense frequency is required",
          });
        }
        if (item.expense_value === undefined || item.expense_value === null) {
          errors.push({ row: index + 1, error: "Expense value is required" });
        }
        if (!item.expsense_currency) {
          errors.push({ row: index + 1, error: "Currency is required" });
        }
        if ((!item.PO_id && !item.CWO_id) || (item.PO_id && item.CWO_id)) {
          errors.push({
            row: index + 1,
            error: "Either PO_id or CWO_id must be provided (not both)",
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
      // Process each expense one by one
      for (const expense of csvData) {
        await createExpense.mutateAsync(expense as any);
      }

      toast.success(`Successfully imported ${csvData.length} expenses`);
      return Promise.resolve();
    } catch (error) {
      console.error("Error importing CSV data:", error);
      toast.error("Failed to import expenses from CSV");
      return Promise.reject(error);
    }
  };

  const formatCurrency = (value: number, currency: string) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency || "USD",
      minimumFractionDigits: 2,
    }).format(value);
  };

  const columns: ColumnDef<ExpenseType>[] = [
    {
      accessorKey: "expense_id",
      header: "ID",
      cell: ({ row }) => (
        <div className="font-mono text-xs">
          {(row.getValue("expense_id") as string).substring(0, 8)}...
        </div>
      ),
    },
    {
      accessorKey: "expense_type",
      header: "Type",
      cell: ({ row }) => {
        const type = row.getValue("expense_type") as ExpenseTypeEnum;
        return (
          <Badge
            className={
              type === ExpenseTypeEnum.charged ? "bg-blue-500" : "bg-green-500"
            }
          >
            {type}
          </Badge>
        );
      },
    },
    {
      accessorKey: "expense_frequency",
      header: "Frequency",
      cell: ({ row }) => {
        const frequency = row.getValue("expense_frequency") as string;
        return <div>{frequency}</div>;
      },
    },
    {
      accessorKey: "expense_value",
      header: "Value",
      cell: ({ row }) => {
        const value = row.getValue("expense_value") as number;
        const currency = row.original.expsense_currency || "USD";
        return (
          <div className="font-medium">{formatCurrency(value, currency)}</div>
        );
      },
    },
    {
      accessorKey: "pro_rata_percentage",
      header: "Pro Rata %",
      cell: ({ row }) => {
        const percentage = row.getValue("pro_rata_percentage") as number;
        return <div>{percentage}%</div>;
      },
    },
    {
      accessorKey: "PO_id",
      header: "PO ID",
      cell: ({ row }) => {
        const poId = row.getValue("PO_id") as string | undefined;
        return <div>{poId || "-"}</div>;
      },
    },
    {
      accessorKey: "CWO_id",
      header: "CWO ID",
      cell: ({ row }) => {
        const cwoId = row.getValue("CWO_id") as string | undefined;
        return <div>{cwoId || "-"}</div>;
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
            onClick={() => handleEditClick(row.original.expense_id)}
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleDeleteClick(row.original.expense_id)}
          >
            <Trash2 className="h-4 w-4 text-red-500" />
          </Button>
          <ExpenseDetails expense={row.original} />
        </div>
      ),
    },
  ];

  const filteredData = expenses.filter(
    (expense) =>
      expense.expense_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      expense.expense_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      expense.expense_frequency
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      (expense.PO_id || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (expense.CWO_id || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-8">
      <div className="mb-8 flex justify-between items-center">
        <h1 className="text-2xl font-semibold">Expense Management</h1>
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
            Add Expense
          </Button>
        </div>
      </div>

      <div className="mb-6 flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
          <Input
            className="pl-10"
            placeholder="Search expenses..."
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
      <ExpenseForm
        expenseId={selectedExpenseId || undefined}
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
              expense and may affect related records.
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
