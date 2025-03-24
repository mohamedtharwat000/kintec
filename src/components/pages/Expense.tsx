"use client";

import { useState } from "react";
import {
  useExpenses,
  useDeleteExpense,
  useCreateExpense,
  useSearchFilter,
  useParseExpenseCsv,
} from "@/hooks/useExpenses";
import { DataTable } from "@/components/dataTable/DataTable";
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Plus, Search, Pencil, Trash2, Upload, Info } from "lucide-react";
import { Input } from "@/components/ui/input";
import { ExpenseForm } from "@/components/forms/Expense";
import { Badge } from "@/components/ui/badge";
import { ExpenseView, ExpenseType, ExpenseFrequency } from "@/types/Expense";
import { toast } from "sonner";
import { CSVPreviewDialog } from "@/components/reusableModels/CSVPreviewDialog";
import { DeleteConfirmationDialog } from "@/components/reusableModels/DeleteConfirmationDialog";
import {
  DetailsDialog,
  DetailSection,
} from "@/components/reusableModels/DetailsDialog";

export function Expense() {
  // Core data fetching hook
  const { data: expenses = [], isLoading, refetch } = useExpenses();
  const deleteExpense = useDeleteExpense();
  const createExpense = useCreateExpense();
  const parseCSV = useParseExpenseCsv();

  // Page-level state management
  const [searchTerm, setSearchTerm] = useState("");

  // Form dialog state
  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
  const [selectedExpenseId, setSelectedExpenseId] = useState<
    string | undefined
  >();

  // Details dialog state
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [selectedExpenseForDetails, setSelectedExpenseForDetails] = useState<
    ExpenseView | undefined
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
  const [expenseToDelete, setExpenseToDelete] = useState<string | null>(null);

  // Filter data based on search term
  const filteredData = useSearchFilter<ExpenseView>(expenses, searchTerm, [
    "expense_id",
    "expense_type",
    "expense_frequency",
    "expsense_currency",
    "PO_id",
    "CWO_id",
  ]);

  // Simple handlers for UI actions
  const handleAddClick = () => {
    setSelectedExpenseId(undefined);
    setIsFormDialogOpen(true);
  };

  const handleEditClick = (expenseId: string) => {
    setSelectedExpenseId(expenseId);
    setIsFormDialogOpen(true);
  };

  const handleDetailsClick = (expense: ExpenseView) => {
    setSelectedExpenseForDetails(expense);
    setIsDetailsDialogOpen(true);
  };

  const handleDeleteClick = (expenseId: string) => {
    setExpenseToDelete(expenseId);
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
      await createExpense.mutateAsync(csvData);
      toast.success(`Successfully imported ${csvData.length} expenses`);
      refetch();
      setIsCSVDialogOpen(false);

      setCsvData([]);
      setCsvValidationErrors([]);
      setUploadFile(null);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      toast.error(`Failed to import expenses: ${errorMessage}`);
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

  // Generate detail sections for the expense
  const getExpenseDetailSections = (): DetailSection[] => {
    if (!selectedExpenseForDetails) return [];

    const formatCurrency = (value: any, currency: string) =>
      new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: currency || "USD",
      }).format(safelyParseNumber(value));

    return [
      {
        title: "Expense Information",
        items: [
          { label: "Expense ID", value: selectedExpenseForDetails.expense_id },
          {
            label: "Type",
            value: (
              <Badge
                className={getTypeBadgeClass(
                  selectedExpenseForDetails.expense_type as ExpenseType
                )}
              >
                {selectedExpenseForDetails.expense_type
                  .charAt(0)
                  .toUpperCase() +
                  selectedExpenseForDetails.expense_type.slice(1)}
              </Badge>
            ),
          },
          {
            label: "Frequency",
            value:
              selectedExpenseForDetails.expense_frequency
                .charAt(0)
                .toUpperCase() +
              selectedExpenseForDetails.expense_frequency.slice(1),
          },
          {
            label: "Value",
            value: formatCurrency(
              selectedExpenseForDetails.expense_value,
              selectedExpenseForDetails.expsense_currency
            ),
          },
          {
            label: "Pro Rata Percentage",
            value: `${selectedExpenseForDetails.pro_rata_percentage}%`,
          },
          {
            label: "Purchase Order",
            value: selectedExpenseForDetails.PO_id || "Not applicable",
          },
          {
            label: "Call-off Work Order",
            value: selectedExpenseForDetails.CWO_id || "Not applicable",
          },
        ],
      },
    ];
  };

  const formatCurrency = (value: any, currency: string) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency || "USD",
    }).format(safelyParseNumber(value));
  };

  const getTypeBadgeClass = (type: ExpenseType) => {
    return type === ExpenseType.charged
      ? "bg-blue-500 hover:bg-blue-600"
      : "bg-green-500 hover:bg-green-600";
  };

  const columns: ColumnDef<ExpenseView>[] = [
    {
      accessorKey: "expense_id",
      header: "ID",
      cell: ({ row }) => (
        <div className="font-mono text-xs truncate max-w-[120px] md:max-w-none">
          {row.getValue("expense_id")}
        </div>
      ),
    },
    {
      accessorKey: "expense_type",
      header: "Type",
      cell: ({ row }) => {
        const type = row.getValue("expense_type") as ExpenseType;
        return (
          <Badge className={getTypeBadgeClass(type)}>
            {type.charAt(0).toUpperCase() + type.slice(1)}
          </Badge>
        );
      },
    },
    {
      accessorKey: "expense_frequency",
      header: "Frequency",
      cell: ({ row }) => {
        const frequency = row.getValue("expense_frequency") as string;
        return (
          <div>{frequency.charAt(0).toUpperCase() + frequency.slice(1)}</div>
        );
      },
    },
    {
      accessorKey: "expense_value",
      header: "Value",
      cell: ({ row }) => {
        const value = row.getValue("expense_value");
        const currency = row.original.expsense_currency;
        return <div>{formatCurrency(value, currency)}</div>;
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
      id: "order_reference",
      header: "Order Reference",
      cell: ({ row }) => {
        const poId = row.original.PO_id;
        const cwoId = row.original.CWO_id;
        return (
          <div className="truncate max-w-[120px] md:max-w-none">
            {poId ? `PO: ${poId}` : cwoId ? `CWO: ${cwoId}` : "-"}
          </div>
        );
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
              onClick={() => handleEditClick(row.original.expense_id)}
            >
              <Pencil className="h-4 w-4" />
            </Button> */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleDeleteClick(row.original.expense_id)}
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
      <h1 className="text-xl sm:text-2xl font-semibold">Expense Management</h1>
      <div className="flex flex-wrap justify-between items-center gap-2">
        <div className="relative flex flex-1 items-center gap-2">
          <Button
            size="sm"
            className="w-full sm:w-auto"
            onClick={handleAddClick}
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Expense
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
            placeholder="Search expenses..."
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
      <ExpenseForm
        expenseId={selectedExpenseId}
        open={isFormDialogOpen}
        onClose={() => setIsFormDialogOpen(false)}
        onSuccess={handleFormSuccess}
      />

      {/* Details Dialog */}
      {selectedExpenseForDetails && (
        <DetailsDialog
          title={`Expense: ${selectedExpenseForDetails.expense_id}`}
          open={isDetailsDialogOpen}
          onClose={() => setIsDetailsDialogOpen(false)}
          sections={getExpenseDetailSections()}
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
          title="Import Expenses"
          description="Review expense data before import"
        />
      )}

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmationDialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onDelete={deleteExpense.mutateAsync}
        itemId={expenseToDelete}
        title="Delete Expense"
        description="Are you sure you want to delete this expense? This action cannot be undone."
        successMessage="Expense deleted successfully"
        errorMessage="Failed to delete expense"
      />
    </div>
  );
}
