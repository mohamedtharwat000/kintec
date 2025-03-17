"use client";

import { useState } from "react";
import {
  useCwoRules,
  useDeleteCwoRule,
  useCreateCwoRule,
  useSearchFilter,
  useParseCwoRuleCsv,
} from "@/hooks/useCwoRules";
import { useCalloffWorkOrders } from "@/hooks/useCalloffWorkOrders";
import { DataTable } from "@/components/dataTable/DataTable";
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Plus, Search, Pencil, Trash2, Upload, Info } from "lucide-react";
import { Input } from "@/components/ui/input";
import { CwoRuleForm } from "@/components/forms/CwoRule";
import { CWO_Rule } from "@/types/CWORule";
import { CSVPreviewDialog } from "@/components/reusableModels/CSVPreviewDialog";
import { DeleteConfirmationDialog } from "@/components/reusableModels/DeleteConfirmationDialog";
import {
  DetailsDialog,
  DetailSection,
} from "@/components/reusableModels/DetailsDialog";
import { toast } from "sonner";

export function CwoRule() {
  // Core data fetching hook
  const { data: cwoRules = [], isLoading, refetch } = useCwoRules();
  const { data: calloffWorkOrders = [] } = useCalloffWorkOrders();
  const deleteCwoRule = useDeleteCwoRule();
  const createCwoRule = useCreateCwoRule();
  const parseCSV = useParseCwoRuleCsv();

  // Page-level state management
  const [searchTerm, setSearchTerm] = useState("");

  // Form dialog state
  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
  const [selectedRuleId, setSelectedRuleId] = useState<string>();

  // Details dialog state
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [selectedRuleForDetails, setSelectedRuleForDetails] = useState<
    CWO_Rule | undefined
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
  const filteredData = useSearchFilter<CWO_Rule>(cwoRules, searchTerm, [
    "CWO_rule_id",
    "CWO_id",
    "CWO_number_format",
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

  const handleDetailsClick = (rule: CWO_Rule) => {
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
      await createCwoRule.mutateAsync(csvData);
      toast.success(`Successfully imported ${csvData.length} CWO rules`);
      refetch();
      setIsCSVDialogOpen(false);

      setCsvData([]);
      setCsvValidationErrors([]);
      setUploadFile(null);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      toast.error(`Failed to import CWO rules: ${errorMessage}`);
    }
  };

  const handleFormSuccess = () => {
    refetch();
    setIsFormDialogOpen(false);
  };

  // Find the related calloff work order for a rule
  const getCwoForRule = (cwoId: string) => {
    return calloffWorkOrders.find(cwo => cwo.CWO_id === cwoId);
  };

  // Generate detail sections for the CWO rule
  const getRuleDetailSections = (): DetailSection[] => {
    if (!selectedRuleForDetails) return [];

    const relatedCwo = getCwoForRule(selectedRuleForDetails.CWO_id);

    return [
      {
        title: "CWO Rule Information",
        items: [
          { label: "Rule ID", value: selectedRuleForDetails.CWO_rule_id },
          { label: "CWO ID", value: selectedRuleForDetails.CWO_id },
          {
            label: "CWO Number Format",
            value: selectedRuleForDetails.CWO_number_format || "Not specified",
          },
          {
            label: "Final Invoice Label",
            value:
              selectedRuleForDetails.final_invoice_label || "Not specified",
          },
          {
            label: "Extension Handling",
            value:
              selectedRuleForDetails.CWO_extension_handling || "Not specified",
          },
          {
            label: "Mobilization/Demobilization Fee Rules",
            value:
              selectedRuleForDetails.mob_demob_fee_rules || "Not specified",
          },
        ],
      },
      ...(relatedCwo
        ? [
            {
              title: "Related Call-off Work Order",
              items: [
                {
                  label: "CWO ID",
                  value: relatedCwo.CWO_id,
                },
                {
                  label: "Contract",
                  value: relatedCwo.contract?.job_title || "N/A",
                },
                {
                  label: "CWO Status",
                  value: relatedCwo.CWO_status || "N/A",
                },
              ],
            },
          ]
        : []),
    ];
  };

  const columns: ColumnDef<CWO_Rule>[] = [
    {
      accessorKey: "CWO_rule_id",
      header: "Rule ID",
      cell: ({ row }) => (
        <div className="font-mono text-xs truncate max-w-[120px] md:max-w-none">
          {row.getValue("CWO_rule_id")}
        </div>
      ),
    },
    {
      accessorKey: "CWO_id",
      header: "CWO ID",
      cell: ({ row }) => (
        <div className="truncate max-w-[120px] md:max-w-none">
          {row.getValue("CWO_id")}
        </div>
      ),
    },
    {
      id: "job_title",
      header: "Associated Contract",
      cell: ({ row }) => {
        const cwoId = row.original.CWO_id;
        const relatedCwo = getCwoForRule(cwoId);
        return (
          <div className="truncate max-w-[150px] md:max-w-none">
            {relatedCwo?.contract?.job_title || "No contract found"}
          </div>
        );
      },
    },
    {
      accessorKey: "CWO_number_format",
      header: "Number Format",
      cell: ({ row }) => (
        <div className="truncate max-w-[150px] md:max-w-none">
          {row.getValue("CWO_number_format") || "Not specified"}
        </div>
      ),
    },
    {
      accessorKey: "final_invoice_label",
      header: "Invoice Label",
      cell: ({ row }) => (
        <div className="truncate max-w-[150px] md:max-w-none">
          {row.getValue("final_invoice_label") || "Not specified"}
        </div>
      ),
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
              onClick={() => handleEditClick(row.original.CWO_rule_id)}
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleDeleteClick(row.original.CWO_rule_id)}
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
        Call-off Work Order Rules
      </h1>
      <div className="flex flex-wrap justify-between items-center gap-2">
        <div className="relative flex flex-1 items-center gap-2">
          <Button
            size="sm"
            className="w-full sm:w-auto"
            onClick={handleAddClick}
          >
            <Plus className="mr-2 h-4 w-4" />
            Add CWO Rule
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
            placeholder="Search CWO rules..."
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
      <CwoRuleForm
        ruleId={selectedRuleId}
        open={isFormDialogOpen}
        onClose={() => setIsFormDialogOpen(false)}
        onSuccess={handleFormSuccess}
      />

      {/* Details Dialog */}
      {selectedRuleForDetails && (
        <DetailsDialog
          title={`CWO Rule: ${selectedRuleForDetails.CWO_rule_id}`}
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
          title="Import CWO Rules"
          description="Review CWO rule data before import"
        />
      )}

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmationDialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onDelete={deleteCwoRule.mutateAsync}
        itemId={ruleToDelete}
        title="Delete CWO Rule"
        description="Are you sure you want to delete this CWO rule? This action cannot be undone."
        successMessage="CWO rule deleted successfully"
        errorMessage="Failed to delete CWO rule"
      />
    </div>
  );
}
