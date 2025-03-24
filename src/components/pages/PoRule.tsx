"use client";

import { useState } from "react";
import {
  useRpoRules,
  useDeleteRpoRule,
  useCreateRpoRule,
  useSearchFilter,
  useParseRpoRuleCsv,
} from "@/hooks/useRpoRules";
import { DataTable } from "@/components/dataTable/DataTable";
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Plus, Search, Pencil, Trash2, Upload, Info } from "lucide-react";
import { Input } from "@/components/ui/input";
import { PoRuleForm } from "@/components/forms/PoRule";
import { RPO_Rule } from "@/types/PORule";
import { toast } from "sonner";
import { CSVPreviewDialog } from "@/components/reusableModels/CSVPreviewDialog";
import { DeleteConfirmationDialog } from "@/components/reusableModels/DeleteConfirmationDialog";
import {
  DetailsDialog,
  DetailSection,
} from "@/components/reusableModels/DetailsDialog";

export function PoRule() {
  // Core data fetching hook
  const { data: poRules = [], isLoading, refetch } = useRpoRules();
  const deletePoRule = useDeleteRpoRule();
  const createPoRule = useCreateRpoRule();
  const parseCSV = useParseRpoRuleCsv();

  // Page-level state management
  const [searchTerm, setSearchTerm] = useState("");

  // Form dialog state
  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
  const [selectedRuleId, setSelectedRuleId] = useState<string | undefined>(
    undefined
  );

  // Details dialog state
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [selectedRuleForDetails, setSelectedRuleForDetails] = useState<
    RPO_Rule | undefined
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
  const filteredData = useSearchFilter<RPO_Rule>(poRules, searchTerm, [
    "PO_id",
    "RPO_number_format",
    "final_invoice_label",
  ]);

  // Simple handlers for UI actions
  const handleAddClick = () => {
    setSelectedRuleId(undefined);
    setIsFormDialogOpen(true);
  };

  const handleEditClick = (ruleId: string) => {
    setSelectedRuleId(ruleId);
    setIsFormDialogOpen(true);
  };

  const handleDetailsClick = (rule: RPO_Rule) => {
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
      await createPoRule.mutateAsync(csvData);
      toast.success(`Successfully imported ${csvData.length} PO rules`);
      refetch();
      setIsCSVDialogOpen(false);
      setCsvData([]);
      setCsvValidationErrors([]);
      setUploadFile(null);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      toast.error(`Failed to import PO rules: ${errorMessage}`);
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
        title: "Purchase Order Rule Information",
        items: [
          { label: "Rule ID", value: selectedRuleForDetails.RPO_rule_id },
          { label: "Purchase Order ID", value: selectedRuleForDetails.PO_id },
          {
            label: "Number Format",
            value: selectedRuleForDetails.RPO_number_format || "Not specified",
          },
          {
            label: "Final Invoice Label",
            value:
              selectedRuleForDetails.final_invoice_label || "Not specified",
          },
          {
            label: "Extension Handling",
            value:
              selectedRuleForDetails.RPO_extension_handling || "Not specified",
            colSpan: 2,
          },
          {
            label: "Mobilization/Demobilization Fee Rules",
            value:
              selectedRuleForDetails.mob_demob_fee_rules || "Not specified",
            colSpan: 2,
          },
        ],
      },
    ];
  };

  const columns: ColumnDef<RPO_Rule>[] = [
    {
      accessorKey: "RPO_rule_id",
      header: () => <div className="text-center">Rule ID</div>,
      cell: ({ row }) => (
        <div className="font-mono text-xs text-center">
          {row.getValue("RPO_rule_id")}
        </div>
      ),
    },
    {
      accessorKey: "PO_id",
      header: () => <div className="text-center">PO ID</div>,
      cell: ({ row }) => (
        <div className="font-mono text-xs text-center">
          {row.getValue("PO_id")}
        </div>
      ),
    },
    {
      accessorKey: "RPO_number_format",
      header: () => <div className="text-center">Number Format</div>,
      cell: ({ row }) => (
        <div className="text-center">
          {row.getValue("RPO_number_format") || "—"}
        </div>
      ),
    },
    {
      accessorKey: "final_invoice_label",
      header: () => <div className="text-center">Final Invoice Label</div>,
      cell: ({ row }) => (
        <div className="text-center">
          {row.getValue("final_invoice_label") || "—"}
        </div>
      ),
    },
    {
      id: "actions",
      header: () => <div className="text-center">Actions</div>,
      cell: ({ row }) => {
        return (
          <div className="flex justify-center gap-2">
            {/* <Button
              variant="ghost"
              size="icon"
              onClick={() => handleEditClick(row.original.RPO_rule_id)}
            >
              <Pencil className="h-4 w-4" />
            </Button> */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleDeleteClick(row.original.RPO_rule_id)}
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
        Purchase Order Rules Management
      </h1>
      <div className="flex flex-wrap justify-between items-center gap-2">
        <div className="relative flex flex-1 items-center gap-2">
          <Button
            size="sm"
            className="w-full sm:w-auto"
            onClick={handleAddClick}
          >
            <Plus className="mr-2 h-4 w-4" />
            Add PO Rule
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
            placeholder="Search PO rules..."
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
      <PoRuleForm
        ruleId={selectedRuleId}
        open={isFormDialogOpen}
        onClose={() => setIsFormDialogOpen(false)}
        onSuccess={handleFormSuccess}
      />

      {/* Details Dialog */}
      {selectedRuleForDetails && (
        <DetailsDialog
          title={`PO Rule: ${selectedRuleForDetails.RPO_rule_id}`}
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
          title="Import PO Rules"
          description="Review purchase order rule data before import"
        />
      )}

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmationDialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onDelete={deletePoRule.mutateAsync}
        itemId={ruleToDelete}
        title="Delete Purchase Order Rule"
        description="Are you sure you want to delete this purchase order rule? This action cannot be undone."
        successMessage="Purchase order rule deleted successfully"
        errorMessage="Failed to delete purchase order rule"
      />
    </div>
  );
}
