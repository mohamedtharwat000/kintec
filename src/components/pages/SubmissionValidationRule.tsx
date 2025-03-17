"use client";

import { useState } from "react";
import {
  useSubmissionValidationRules,
  useDeleteSubmissionValidationRule,
  useCreateSubmissionValidationRule,
} from "@/hooks/useSubmissionValidationRules";
import { DataTable } from "@/components/dataTable/DataTable";
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Plus, Search, Pencil, Trash2, Upload, Info } from "lucide-react";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { SubmissionValidationRule as SubmissionValidationRuleType } from "@/types/Submission";
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
import { SubmissionValidationRuleForm } from "@/components/forms/SubmissionValidationRuleForm";
import { SubmissionValidationRuleDetails } from "@/components/000/SubmissionValidationRuleDetails";
import { CSVPreviewDialog } from "@/components/csvPreviewDialog/SubmissionValidationRule";
import { parseSubmissionValidationRule } from "@/lib/csv/submissionValidationRule";

export function SubmissionValidationRule() {
  const { data: rules = [], isLoading } = useSubmissionValidationRules();
  const deleteRule = useDeleteSubmissionValidationRule();
  const createRule = useCreateSubmissionValidationRule();

  const [searchTerm, setSearchTerm] = useState("");
  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
  const [selectedRuleId, setSelectedRuleId] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [ruleToDelete, setRuleToDelete] = useState<string | null>(null);
  const [viewDetailsOpen, setViewDetailsOpen] = useState(false);
  const [selectedRule, setSelectedRule] =
    useState<SubmissionValidationRuleType | null>(null);

  // CSV upload state
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [csvData, setCsvData] = useState<any[]>([]);
  const [csvDataToUpload, setCsvDataToUpload] = useState<any[]>([]);
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

  const handleViewDetails = (rule: SubmissionValidationRuleType) => {
    setSelectedRule(rule);
    setViewDetailsOpen(true);
  };

  const handleDeleteClick = (ruleId: string) => {
    setRuleToDelete(ruleId);
    setDeleteDialogOpen(true);
  };

  const handleFormClose = () => {
    setIsFormDialogOpen(false);
  };

  const handleFormSuccess = () => {
    // The form itself will handle success actions
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
      // Parse CSV file using the dedicated parser
      const result = await parseSubmissionValidationRule(file);

      setCsvFileName(file.name);
      setCsvData(result.data);
      setCsvDataToUpload(result.dataToUpload);
      setValidationErrors(result.errors);

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
      // Submit all CSV data as an array to the API
      await Promise.all(
        csvDataToUpload.map((rule) => createRule.mutateAsync(rule))
      );

      toast.success(
        `Successfully imported ${csvDataToUpload.length} validation rules`
      );
      setCsvData([]);
      setCsvDataToUpload([]);
      setCsvFileName("");
      return Promise.resolve();
    } catch (error) {
      console.error("Error importing CSV data:", error);
      toast.error("Failed to import validation rules from CSV");
      return Promise.reject(error);
    }
  };

  const columns: ColumnDef<SubmissionValidationRuleType>[] = [
    {
      accessorKey: "sub_val_rule_id",
      header: "ID",
      cell: ({ row }) => (
        <div className="font-mono text-xs w-32 truncate">
          {row.getValue("sub_val_rule_id")}
        </div>
      ),
    },
    {
      accessorKey: "submission_id",
      header: "Submission ID",
      cell: ({ row }) => (
        <div className="font-mono text-xs w-32 truncate">
          {row.getValue("submission_id")}
        </div>
      ),
    },
    {
      accessorKey: "required_fields",
      header: "Required Fields",
      cell: ({ row }) => (
        <div className="w-28 truncate">
          {row.getValue("required_fields") || "N/A"}
        </div>
      ),
    },
    {
      accessorKey: "approval_signature_rules",
      header: "Signature Rules",
      cell: ({ row }) => (
        <div className="w-40 truncate">
          {row.getValue("approval_signature_rules") || "N/A"}
        </div>
      ),
    },
    {
      accessorKey: "approval_date_rules",
      header: "Date Rules",
      cell: ({ row }) => (
        <div className="w-40 truncate">
          {row.getValue("approval_date_rules") || "N/A"}
        </div>
      ),
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <div className="flex space-x-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleEditClick(row.original.sub_val_rule_id)}
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleDeleteClick(row.original.sub_val_rule_id)}
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

  const filteredData = rules.filter(
    (rule) =>
      rule.sub_val_rule_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rule.submission_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (rule.required_fields &&
        rule.required_fields
          .toLowerCase()
          .includes(searchTerm.toLowerCase())) ||
      (rule.approval_signature_rules &&
        rule.approval_signature_rules
          .toLowerCase()
          .includes(searchTerm.toLowerCase())) ||
      (rule.approval_date_rules &&
        rule.approval_date_rules
          .toLowerCase()
          .includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="p-8">
      <div className="mb-8 flex justify-between items-center">
        <h1 className="text-2xl font-semibold">Submission Validation Rules</h1>
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
            Add Validation Rule
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

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete this
              submission validation rule.
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

      {/* Add/Edit Form Dialog */}
      {isFormDialogOpen && (
        <SubmissionValidationRuleForm
          ruleId={selectedRuleId || undefined}
          open={isFormDialogOpen}
          onClose={handleFormClose}
          onSuccess={handleFormSuccess}
        />
      )}

      {/* Details Dialog */}
      {viewDetailsOpen && selectedRule && (
        <SubmissionValidationRuleDetails
          rule={selectedRule}
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
