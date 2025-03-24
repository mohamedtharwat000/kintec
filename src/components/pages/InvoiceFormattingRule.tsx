"use client";

import { useState } from "react";
import {
  useInvoiceFormattingRules,
  useDeleteInvoiceFormattingRule,
  useCreateInvoiceFormattingRule,
  useSearchFilter,
  useParseInvoiceFormattingRuleCsv,
} from "@/hooks/useInvoiceFormattingRules";
import { DataTable } from "@/components/dataTable/DataTable";
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Plus, Search, Pencil, Trash2, Upload, Info } from "lucide-react";
import { Input } from "@/components/ui/input";
import { InvoiceFormattingRuleForm } from "@/components/forms/InvoiceFormattingRule";
import { InvoiceFormattingRule as InvoiceFormattingRuleType } from "@/types/InvoiceFormattingRule";
import { toast } from "sonner";
import { CSVPreviewDialog } from "@/components/reusableModels/CSVPreviewDialog";
import { DeleteConfirmationDialog } from "@/components/reusableModels/DeleteConfirmationDialog";
import {
  DetailsDialog,
  DetailSection,
} from "@/components/reusableModels/DetailsDialog";

export function InvoiceFormattingRule() {
  // Core data fetching hook
  const {
    data: formattingRules = [],
    isLoading,
    refetch,
  } = useInvoiceFormattingRules();
  const deleteFormattingRule = useDeleteInvoiceFormattingRule();
  const createFormattingRule = useCreateInvoiceFormattingRule();
  const parseCSV = useParseInvoiceFormattingRuleCsv();

  // Page-level state management
  const [searchTerm, setSearchTerm] = useState("");

  // Form dialog state
  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
  const [selectedRuleId, setSelectedRuleId] = useState<string | undefined>();

  // Details dialog state
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [selectedRuleForDetails, setSelectedRuleForDetails] = useState<
    InvoiceFormattingRuleType | undefined
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
  const filteredData = useSearchFilter<InvoiceFormattingRuleType>(
    formattingRules,
    searchTerm,
    [
      "inv_formatting_rule_id",
      "invoice_id",
      "file_format",
      "required_invoice_fields",
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

  const handleDetailsClick = (rule: InvoiceFormattingRuleType) => {
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
      await createFormattingRule.mutateAsync(csvData);
      toast.success(`Successfully imported ${csvData.length} formatting rules`);
      refetch();
      setIsCSVDialogOpen(false);

      setCsvData([]);
      setCsvValidationErrors([]);
      setUploadFile(null);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      toast.error(`Failed to import formatting rules: ${errorMessage}`);
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
        title: "Invoice Formatting Rule Information",
        items: [
          {
            label: "Rule ID",
            value: selectedRuleForDetails.inv_formatting_rule_id,
          },
          { label: "Invoice ID", value: selectedRuleForDetails.invoice_id },
          {
            label: "File Format",
            value: selectedRuleForDetails.file_format || "Not specified",
          },
          {
            label: "Required Invoice Fields",
            value:
              selectedRuleForDetails.required_invoice_fields || "Not specified",
          },
          {
            label: "Attachment Requirements",
            value:
              selectedRuleForDetails.attachment_requirements || "Not specified",
          },
        ],
      },
    ];
  };

  const columns: ColumnDef<InvoiceFormattingRuleType>[] = [
    {
      accessorKey: "inv_formatting_rule_id",
      header: "ID",
      cell: ({ row }) => (
        <div className="font-mono text-xs">
          {row.getValue("inv_formatting_rule_id")}
        </div>
      ),
    },
    {
      accessorKey: "invoice_id",
      header: "Invoice ID",
      cell: ({ row }) => (
        <div className="font-mono text-xs">{row.getValue("invoice_id")}</div>
      ),
    },
    {
      accessorKey: "file_format",
      header: "File Format",
      cell: ({ row }) => {
        const format = row.getValue("file_format") as string;
        return <div>{format || "Not specified"}</div>;
      },
    },
    {
      accessorKey: "required_invoice_fields",
      header: "Required Fields",
      cell: ({ row }) => {
        const fields = row.getValue("required_invoice_fields") as string;
        return (
          <div className="max-w-[200px] truncate" title={fields || ""}>
            {fields || "Not specified"}
          </div>
        );
      },
    },
    {
      accessorKey: "attachment_requirements",
      header: "Attachment Requirements",
      cell: ({ row }) => {
        const requirements = row.getValue("attachment_requirements") as string;
        return (
          <div className="max-w-[200px] truncate" title={requirements || ""}>
            {requirements || "Not specified"}
          </div>
        );
      },
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <div className="flex justify-center gap-2">
          {/* <Button
            variant="ghost"
            size="icon"
            onClick={() => handleEditClick(row.original.inv_formatting_rule_id)}
          >
            <Pencil className="h-4 w-4" />
          </Button> */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() =>
              handleDeleteClick(row.original.inv_formatting_rule_id)
            }
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
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-4 p-4">
      <h1 className="text-xl sm:text-2xl font-semibold">
        Invoice Formatting Rules
      </h1>
      <div className="flex flex-wrap justify-between items-center gap-2">
        <div className="relative flex flex-1 items-center gap-2">
          <Button
            size="sm"
            className="w-full sm:w-auto"
            onClick={handleAddClick}
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Rule
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
            placeholder="Search formatting rules..."
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
      <InvoiceFormattingRuleForm
        ruleId={selectedRuleId}
        open={isFormDialogOpen}
        onClose={() => setIsFormDialogOpen(false)}
        onSuccess={handleFormSuccess}
      />

      {/* Details Dialog */}
      {selectedRuleForDetails && (
        <DetailsDialog
          title={`Invoice Formatting Rule: ${selectedRuleForDetails.inv_formatting_rule_id}`}
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
          title="Import Invoice Formatting Rules"
          description="Review rule data before import"
        />
      )}

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmationDialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onDelete={deleteFormattingRule.mutateAsync}
        itemId={ruleToDelete}
        title="Delete Invoice Formatting Rule"
        description="Are you sure you want to delete this formatting rule? This action cannot be undone."
        successMessage="Invoice formatting rule deleted successfully"
        errorMessage="Failed to delete invoice formatting rule"
      />
    </div>
  );
}
