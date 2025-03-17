"use client";

import { useState } from "react";
import {
  useExpenseValidationRules,
  useDeleteExpenseValidationRule,
  useCreateExpenseValidationRule,
  useSearchFilter,
  useParseExpenseValidationRuleCsv,
} from "@/hooks/useExpenseValidationRules";
import { DataTable } from "@/components/dataTable/DataTable";
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Plus, Search, Pencil, Trash2, Upload, Info } from "lucide-react";
import { Input } from "@/components/ui/input";
import { ExpenseValidationRuleForm } from "@/components/forms/ExpenseValidationRule";
import { Badge } from "@/components/ui/badge";
import { ExpenseValidationRule as ExpenseValidationRuleType } from "@/types/ExpenseValidationRule";
import { toast } from "sonner";
import { CSVPreviewDialog } from "@/components/reusableModels/CSVPreviewDialog";
import { DeleteConfirmationDialog } from "@/components/reusableModels/DeleteConfirmationDialog";
import {
  DetailsDialog,
  DetailSection,
} from "@/components/reusableModels/DetailsDialog";

export function ExpenseValidationRule() {
  // Core data fetching hook
  const { data: rules = [], isLoading, refetch } = useExpenseValidationRules();
  const deleteRule = useDeleteExpenseValidationRule();
  const createRule = useCreateExpenseValidationRule();
  const parseCSV = useParseExpenseValidationRuleCsv();

  // Page-level state management
  const [searchTerm, setSearchTerm] = useState("");

  // Form dialog state
  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
  const [selectedRuleId, setSelectedRuleId] = useState<string | undefined>();

  // Details dialog state
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [selectedRuleForDetails, setSelectedRuleForDetails] = useState<
    ExpenseValidationRuleType | undefined
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
  const [ruleToDelete, setRuleToDelete] = useState<string | null>(null);

  // Filter data based on search term
  const filteredData = useSearchFilter<ExpenseValidationRuleType>(
    rules,
    searchTerm,
    [
      "exp_val_rule_id",
      "expense_id",
      "allowable_expense_types",
      "expense_documentation",
      "supporting_documentation_type",
      "expense_limit",
    ]
  );

  // Simple handlers for UI actions
  const handleAddClick = () => {
    setSelectedRuleId(undefined);
    setIsFormDialogOpen(true);
  };

  const handleEditClick = (ruleId: string) => {
    setSelectedRuleId(ruleId);
    setIsFormDialogOpen(true);
  };

  const handleDetailsClick = (rule: ExpenseValidationRuleType) => {
    setSelectedRuleForDetails(rule);
    setIsDetailsDialogOpen(true);
  };

  const handleDeleteClick = (ruleId: string) => {
    setRuleToDelete(ruleId);
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
      await createRule.mutateAsync(csvData);
      toast.success(`Successfully imported ${csvData.length} validation rules`);
      refetch();
      setIsCSVDialogOpen(false);

      setCsvData([]);
      setCsvValidationErrors([]);
      setUploadFile(null);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      toast.error(`Failed to import validation rules: ${errorMessage}`);
    }
  };

  const handleFormSuccess = () => {
    refetch();
    setIsFormDialogOpen(false);
  };

  // Generate detail sections for the rule
  const getRuleDetailSections = (): DetailSection[] => {
    if (!selectedRuleForDetails) return [];

    return [
      {
        title: "Expense Validation Rule Information",
        items: [
          { label: "Rule ID", value: selectedRuleForDetails.exp_val_rule_id },
          { label: "Expense ID", value: selectedRuleForDetails.expense_id },
          {
            label: "Allowable Expense Types",
            value:
              selectedRuleForDetails.allowable_expense_types || "Not specified",
          },
          {
            label: "Expense Documentation",
            value:
              selectedRuleForDetails.expense_documentation || "Not specified",
          },
          {
            label: "Supporting Documentation Type",
            value:
              selectedRuleForDetails.supporting_documentation_type ||
              "Not specified",
          },
          {
            label: "Expense Limit",
            value: selectedRuleForDetails.expense_limit || "Not specified",
          },
          {
            label: "Reimbursement Rule",
            value: selectedRuleForDetails.reimbursement_rule || "Not specified",
          },
        ],
      },
    ];
  };

  const columns: ColumnDef<ExpenseValidationRuleType>[] = [
    {
      accessorKey: "exp_val_rule_id",
      header: "Rule ID",
      cell: ({ row }) => (
        <div className="font-mono text-xs truncate max-w-[120px] md:max-w-none">
          {row.getValue("exp_val_rule_id")}
        </div>
      ),
    },
    {
      accessorKey: "expense_id",
      header: "Expense ID",
      cell: ({ row }) => (
        <div className="font-mono text-xs truncate max-w-[120px] md:max-w-none">
          {row.getValue("expense_id")}
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
      cell: ({ row }) => {
        return (
          <div className="flex justify-center gap-2">
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
        Expense Validation Rules
      </h1>
      <div className="flex flex-wrap justify-between items-center gap-2">
        <div className="relative flex flex-1 items-center gap-2">
          <Button
            size="sm"
            className="w-full sm:w-auto"
            onClick={handleAddClick}
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Validation Rule
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
            placeholder="Search validation rules..."
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
      <ExpenseValidationRuleForm
        ruleId={selectedRuleId}
        open={isFormDialogOpen}
        onClose={() => setIsFormDialogOpen(false)}
        onSuccess={handleFormSuccess}
      />

      {/* Details Dialog */}
      {selectedRuleForDetails && (
        <DetailsDialog
          title={`Expense Validation Rule: ${selectedRuleForDetails.exp_val_rule_id}`}
          open={isDetailsDialogOpen}
          onClose={() => setIsDetailsDialogOpen(false)}
          sections={getRuleDetailSections()}
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
          title="Import Validation Rules"
          description="Review validation rule data before import"
        />
      )}

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmationDialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onDelete={deleteRule.mutateAsync}
        itemId={ruleToDelete}
        title="Delete Validation Rule"
        description="Are you sure you want to delete this validation rule? This action cannot be undone."
        successMessage="Validation rule deleted successfully"
        errorMessage="Failed to delete validation rule"
      />
    </div>
  );
}
