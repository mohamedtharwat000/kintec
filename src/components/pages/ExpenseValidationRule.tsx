"use client";

import { useState } from "react";
import {
  useExpenseValidationRules,
  useDeleteExpenseValidationRule,
  useCreateExpenseValidationRule,
} from "@/hooks/useExpenseValidationRules";
import { DataTable } from "@/components/dataTable/DataTable";
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Plus, Search, Pencil, Trash2, Upload, Info } from "lucide-react";
import { Input } from "@/components/ui/input";
import { ExpenseValidationRule as ExpenseValidationRuleType } from "@/types/Expense";
import { toast } from "sonner";
import { parseExpenseValidationRule } from "@/lib/csv/expenseValidationRule";
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
import { CSVPreviewDialog } from "@/components/csvPreviewDialog/ExpenseValidationRule";
import { ExpenseValidationRuleForm } from "@/components/forms/ExpenseValidationRule";
import { ExpenseValidationRuleDetails } from "@/components/detailsDialogs/ExpenseValidationRule";

export function ExpenseValidationRule() {
  const { data: rules = [], isLoading } = useExpenseValidationRules();
  const deleteRule = useDeleteExpenseValidationRule();
  const createRule = useCreateExpenseValidationRule();

  const [searchTerm, setSearchTerm] = useState("");
  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
  const [selectedRuleId, setSelectedRuleId] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [ruleToDelete, setRuleToDelete] = useState<string | null>(null);

  // CSV upload state
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [csvData, setCsvData] = useState<Partial<ExpenseValidationRuleType>[]>(
    []
  );
  const [csvFileName, setCsvFileName] = useState("");
  const [validationErrors, setValidationErrors] = useState<
    { row: number; error: string }[]
  >([]);

  const handleAddClick = () => {
    setSelectedRuleId(null);
    setIsFormDialogOpen(true);
  };

  const handleEditClick = (ruleId: string) => {
    setSelectedRuleId(ruleId);
    setIsFormDialogOpen(true);
  };

  const handleDeleteClick = (ruleId: string) => {
    setRuleToDelete(ruleId);
    setDeleteDialogOpen(true);
  };

  const handleFormClose = () => {
    setIsFormDialogOpen(false);
  };

  const handleFormSuccess = () => {
    // The form itself will close the dialog
  };

  const handleConfirmDelete = async () => {
    if (!ruleToDelete) return;

    try {
      await deleteRule.mutateAsync(ruleToDelete);
      toast.success("Validation rule deleted successfully");
    } catch (error) {
      toast.error("Failed to delete validation rule");
    } finally {
      setDeleteDialogOpen(false);
      setRuleToDelete(null);
    }
  };

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const result = await parseExpenseValidationRule(file);
      setCsvFileName(file.name);
      setCsvData(result.data);

      // Validate data
      const errors: { row: number; error: string }[] = [];
      result.data.forEach((item, index) => {
        if (!item.expense_id) {
          errors.push({ row: index + 1, error: "Expense ID is required" });
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
      // Process each rule one by one
      for (const rule of csvData) {
        await createRule.mutateAsync(rule as any);
      }

      toast.success(`Successfully imported ${csvData.length} validation rules`);
      return Promise.resolve();
    } catch (error) {
      console.error("Error importing CSV data:", error);
      toast.error("Failed to import validation rules from CSV");
      return Promise.reject(error);
    }
  };

  const columns: ColumnDef<ExpenseValidationRuleType>[] = [
    {
      accessorKey: "exp_val_rule_id",
      header: "Rule ID",
      cell: ({ row }) => (
        <div className="font-mono text-xs">
          {(row.getValue("exp_val_rule_id") as string).substring(0, 8)}...
        </div>
      ),
    },
    {
      accessorKey: "expense_id",
      header: "Expense ID",
      cell: ({ row }) => (
        <div className="font-mono text-xs">
          {(row.getValue("expense_id") as string).substring(0, 8)}...
        </div>
      ),
    },
    {
      accessorKey: "allowable_expense_types",
      header: "Allowable Types",
      cell: ({ row }) => {
        const value = row.getValue("allowable_expense_types") as string;
        return <div>{value || "-"}</div>;
      },
    },
    {
      accessorKey: "expense_documentation",
      header: "Documentation",
      cell: ({ row }) => {
        const value = row.getValue("expense_documentation") as string;
        return <div>{value || "-"}</div>;
      },
    },
    {
      accessorKey: "supporting_documentation_type",
      header: "Support Doc Type",
      cell: ({ row }) => {
        const value = row.getValue("supporting_documentation_type") as string;
        return <div>{value || "-"}</div>;
      },
    },
    {
      accessorKey: "expense_limit",
      header: "Limit",
      cell: ({ row }) => {
        const value = row.getValue("expense_limit") as string;
        return <div>{value || "-"}</div>;
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
            onClick={() => handleEditClick(row.original.exp_val_rule_id)}
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleDeleteClick(row.original.exp_val_rule_id)}
          >
            <Trash2 className="h-4 w-4 text-red-500" />
          </Button>
          <ExpenseValidationRuleDetails rule={row.original} />
        </div>
      ),
    },
  ];

  const filteredData = rules.filter(
    (rule) =>
      rule.expense_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (rule.allowable_expense_types || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      (rule.expense_documentation || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-8">
      <div className="mb-8 flex justify-between items-center">
        <h1 className="text-2xl font-semibold">Expense Validation Rules</h1>
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
            Add Rule
          </Button>
        </div>
      </div>

      <div className="mb-6 flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
          <Input
            className="pl-10"
            placeholder="Search validation rules..."
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
      <ExpenseValidationRuleForm
        ruleId={selectedRuleId || undefined}
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
              validation rule and may affect expense validation.
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
