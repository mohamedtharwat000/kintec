"use client";

import { useState } from "react";
import {
  useInvoiceFormattingRules,
  useDeleteInvoiceFormattingRule,
  useCreateInvoiceFormattingRule,
} from "@/hooks/useInvoiceFormattingRules";
import { DataTable } from "@/components/dataTable/DataTable";
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Plus, Search, Pencil, Trash2, Upload, Info } from "lucide-react";
import { Input } from "@/components/ui/input";
import { InvoiceFormattingRuleForm } from "@/components/forms/InvoiceFormattingRule";
import { InvoiceFormattingRuleDetails } from "@/components/detailsDialogs/InvoiceFormattingRule";
import type { InvoiceFormattingRule } from "@/types/Invoice";
import { toast } from "sonner";
import { parseInvoiceFormattingRule } from "@/lib/csv/invoiceFormattingRule";
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
import { CSVPreviewDialog } from "@/components/csvPreviewDialog/InvoiceFormattingRule";

export function InvoiceFormattingRule() {
  const { data: formattingRules = [], isLoading } = useInvoiceFormattingRules();
  const deleteFormattingRule = useDeleteInvoiceFormattingRule();
  const createFormattingRule = useCreateInvoiceFormattingRule();

  const [searchTerm, setSearchTerm] = useState("");
  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
  const [selectedRuleId, setSelectedRuleId] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [ruleToDelete, setRuleToDelete] = useState<string | null>(null);

  // CSV upload state
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [csvData, setCsvData] = useState<Partial<InvoiceFormattingRule>[]>([]);
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
    setIsFormDialogOpen(false);
  };

  const handleConfirmDelete = async () => {
    if (!ruleToDelete) return;

    try {
      await deleteFormattingRule.mutateAsync(ruleToDelete);
      toast.success("Invoice formatting rule deleted successfully");
    } catch (error) {
      toast.error("Failed to delete invoice formatting rule");
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
      const result = await parseInvoiceFormattingRule(file);
      setCsvFileName(file.name);
      setCsvData(result.data);

      // Validate data
      const errors: { row: number; error: string }[] = [];
      result.data.forEach((item, index) => {
        if (!item.invoice_id) {
          errors.push({ row: index + 1, error: "Invoice ID is required" });
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
        await createFormattingRule.mutateAsync(rule as any);
      }

      toast.success(`Successfully imported ${csvData.length} formatting rules`);
      return Promise.resolve();
    } catch (error) {
      console.error("Error importing CSV data:", error);
      toast.error("Failed to import formatting rules from CSV");
      return Promise.reject(error);
    }
  };

  const columns: ColumnDef<InvoiceFormattingRule>[] = [
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
        <div className="flex space-x-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleEditClick(row.original.inv_formatting_rule_id)}
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() =>
              handleDeleteClick(row.original.inv_formatting_rule_id)
            }
          >
            <Trash2 className="h-4 w-4 text-red-500" />
          </Button>
          <InvoiceFormattingRuleDetails rule={row.original} />
        </div>
      ),
    },
  ];

  const filteredData = formattingRules.filter(
    (rule) =>
      rule.invoice_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (rule.file_format || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      (rule.required_invoice_fields || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-8">
      <div className="mb-8 flex justify-between items-center">
        <h1 className="text-2xl font-semibold">Invoice Formatting Rules</h1>
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
            placeholder="Search formatting rules..."
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
      <InvoiceFormattingRuleForm
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
              formatting rule and may affect related records.
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
