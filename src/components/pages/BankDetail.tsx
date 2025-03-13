"use client";

import { useState } from "react";
import {
  useBankDetails,
  useDeleteBankDetail,
  useCreateBankDetail,
} from "@/hooks/useBankDetail";
import { useContractors } from "@/hooks/useContractor";
import { DataTable } from "@/components/dataTable/DataTable";
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Plus, Search, Pencil, Trash2, Upload, Info } from "lucide-react";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
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
import { BankDetailForm } from "@/components/forms/BankDetail";
import { BankDetailDetails } from "@/components/detailsDialogs/BankDetail";
import { CSVPreviewDialog } from "@/components/csvPreviewDialog/BankDetail";
import { parseBankDetail } from "@/lib/csv/bankDetail";
import { validateBankDetails } from "@/lib/validation/bankDetail";
import { tryCatch } from "@/lib/utils";
import type { BankDetail as BankDetailType } from "@/types/BankDetail";

export function BankDetail() {
  const { data: bankDetails = [], isLoading } = useBankDetails();
  const { data: contractors = [] } = useContractors();
  const deleteDetailMutation = useDeleteBankDetail();
  const createBankDetail = useCreateBankDetail();

  const [searchTerm, setSearchTerm] = useState("");
  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
  const [selectedBankDetailId, setSelectedBankDetailId] = useState<
    string | null
  >(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [bankDetailToDelete, setBankDetailToDelete] = useState<string | null>(
    null
  );
  const [isDeleting, setIsDeleting] = useState(false);
  const [viewDetailsOpen, setViewDetailsOpen] = useState(false);
  const [selectedDetail, setSelectedDetail] = useState<
    BankDetailType | undefined
  >(undefined);

  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [csvData, setCsvData] = useState<Partial<BankDetailType>[]>([]);
  const [csvFileName, setCsvFileName] = useState("");
  const [validationErrors, setValidationErrors] = useState<
    { row: number; error: string }[]
  >([]);

  const handleAddClick = () => {
    setSelectedBankDetailId(null);
    setIsFormDialogOpen(true);
  };

  const handleEditClick = (bankDetailId: string) => {
    setSelectedBankDetailId(bankDetailId);
    setIsFormDialogOpen(true);
  };

  const handleViewDetails = (bankDetail: BankDetailType) => {
    setSelectedDetail(bankDetail);
    setViewDetailsOpen(true);
  };

  const handleDeleteClick = (bankDetailId: string) => {
    setBankDetailToDelete(bankDetailId);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!bankDetailToDelete) return;

    setIsDeleting(true);
    const { error } = await tryCatch(() =>
      deleteDetailMutation.mutateAsync(bankDetailToDelete)
    );

    if (error) {
      toast.error("Failed to delete bank detail: " + error.message);
    } else {
      toast.success("Bank detail deleted successfully");
    }

    setIsDeleting(false);
    setDeleteDialogOpen(false);
    setBankDetailToDelete(null);
  };

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const { data, error } = await tryCatch(() => parseBankDetail(file));

    if (error) {
      toast.error("Failed to parse CSV file: " + error.message);
      event.target.value = "";
      return;
    }

    if (data) {
      setCsvFileName(file.name);
      setCsvData(data.data);
      setValidationErrors(data.errors || []);
      setIsPreviewOpen(true);
    }

    event.target.value = "";
  };

  const handleConfirmCsvUpload = async () => {
    if (validationErrors.length > 0) {
      toast.error("Please fix validation errors before uploading");
      return;
    }

    const { error } = await tryCatch(() =>
      createBankDetail.mutateAsync(csvData)
    );

    if (error) {
      toast.error("Failed to import bank details: " + error.message);
    } else {
      toast.success(`Successfully imported ${csvData.length} bank details`);
      setIsPreviewOpen(false);
      setCsvData([]);
      setCsvFileName("");
    }
  };

  const getContractorName = (contractorId: string) => {
    const contractor = contractors.find(
      (c) => c.contractor_id === contractorId
    );
    return contractor
      ? `${contractor.first_name} ${contractor.last_name}`
      : "Unknown";
  };

  const columns: ColumnDef<any>[] = [
    {
      accessorKey: "bank_detail_id",
      header: () => <div className="text-center">ID</div>,
      cell: ({ row }) => (
        <div className="font-mono text-xs truncate !max-w-[100px] md:max-w-none">
          {row.getValue("bank_detail_id")}
        </div>
      ),
    },
    {
      accessorKey: "contractor_id",
      header: () => <div className="text-center">Contractor</div>,
      cell: ({ row }) => (
        <div className="font-medium truncate max-w-[120px] md:max-w-none">
          {getContractorName(row.getValue("contractor_id"))}
        </div>
      ),
    },
    {
      accessorKey: "bank_name",
      header: () => <div className="text-center">Bank Name</div>,
      cell: ({ row }) => (
        <div className="truncate max-w-[120px] md:max-w-none">
          {row.getValue("bank_name")}
        </div>
      ),
    },
    {
      accessorKey: "IBAN",
      header: () => <div className="text-center">IBAN</div>,
      cell: ({ row }) => (
        <div className="font-mono text-xs truncate max-w-[150px] md:max-w-none">
          {row.getValue("IBAN")}
        </div>
      ),
    },
    {
      accessorKey: "bank_detail_type",
      header: () => <div className="text-center">Type</div>,
      cell: ({ row }) => (
        <div className="capitalize">{row.getValue("bank_detail_type")}</div>
      ),
    },
    {
      id: "actions",
      header: () => <div className="text-center">Actions</div>,
      cell: ({ row }) => {
        return (
          <div className="flex justify-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleEditClick(row.original.bank_detail_id)}
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleDeleteClick(row.original.bank_detail_id)}
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
        );
      },
    },
  ];

  const filteredData = bankDetails.filter(
    (detail) =>
      detail.bank_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      detail.IBAN?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      detail.SWIFT?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      detail.bank_detail_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      getContractorName(detail.contractor_id)
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-4 p-4">
      <h1 className="text-xl sm:text-2xl font-semibold">
        Bank Details Master Data
      </h1>
      <div className="flex flex-wrap justify-between items-center gap-2">
        <div className="relative flex flex-1 items-center gap-2">
          <Button
            size="sm"
            className="w-full sm:w-auto"
            onClick={handleAddClick}
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Bank Detail
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
            onChange={handleFileUpload}
            className="hidden"
            id="csv-upload"
          />
        </div>

        <div className="relative flex flex-1 items-center justify-center gap-2 p-2 min-w-16">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
          <Input
            className="pl-10"
            placeholder="Search bank details..."
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

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={deleteDialogOpen}
        onOpenChange={(open) => {
          if (!isDeleting && !open) {
            setDeleteDialogOpen(false);
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              bank detail and may affect contractor information.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2">
            <AlertDialogCancel className="mt-2 sm:mt-0" disabled={isDeleting}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-red-600 hover:bg-red-700 w-full sm:w-auto"
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <span className="mr-2 inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></span>
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Add/Edit Form Dialog */}
      <BankDetailForm
        bankDetailId={selectedBankDetailId || undefined}
        open={isFormDialogOpen}
        onClose={() => setIsFormDialogOpen(false)}
      />

      {/* Details Dialog */}
      {selectedDetail && (
        <BankDetailDetails
          bankDetail={{
            ...selectedDetail,
            bank_detail_validated:
              selectedDetail.bank_detail_validated ?? false,
            last_updated: new Date(
              selectedDetail.last_updated.toString()
            ).toISOString(),
          }}
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
        title="Preview Bank Details CSV Data"
      />
    </div>
  );
}
