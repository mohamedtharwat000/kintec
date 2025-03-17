"use client";

import { useState } from "react";
import {
  useBankDetails,
  useDeleteBankDetail,
  useCreateBankDetail,
  useParseBankDetailCsv,
  useSearchFilter,
} from "@/hooks/useBankDetail";
import { useContractors } from "@/hooks/useContractor";
import { DataTable } from "@/components/dataTable/DataTable";
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Plus, Search, Pencil, Trash2, Upload, Info } from "lucide-react";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { BankDetailForm } from "@/components/forms/BankDetail";
import { CSVPreviewDialog } from "@/components/reusableModels/CSVPreviewDialog";
import { DeleteConfirmationDialog } from "@/components/reusableModels/DeleteConfirmationDialog";
import type { BankDetail as BankDetailType } from "@/types/BankDetail";
import {
  DetailsDialog,
  DetailSection,
} from "@/components/reusableModels/DetailsDialog";

export function BankDetail() {
  // Core data fetching hook
  const { data: bankDetails = [], isLoading, refetch } = useBankDetails();
  const { data: contractors = [] } = useContractors();
  const deleteDetailMutation = useDeleteBankDetail();
  const createBankDetail = useCreateBankDetail();
  const parseCSV = useParseBankDetailCsv();

  // Page-level state management
  const [searchTerm, setSearchTerm] = useState("");

  // Form dialog state
  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
  const [selectedBankDetailId, setSelectedBankDetailId] = useState<string>();

  // Details dialog state
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [selectedDetailForDetails, setSelectedDetailForDetails] = useState<
    BankDetailType | undefined
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
  const [bankDetailToDelete, setBankDetailToDelete] = useState<string | null>(
    null
  );

  // Filter data based on search term
  const filteredData = useSearchFilter<BankDetailType>(
    bankDetails,
    searchTerm,
    ["bank_name", "IBAN", "SWIFT", "bank_detail_id", "contractor_id"]
  );

  // Simple handlers for UI actions
  const handleAddClick = () => {
    setSelectedBankDetailId(undefined);
    setIsFormDialogOpen(true);
  };

  const handleEditClick = (bankDetailId: string) => {
    setSelectedBankDetailId(bankDetailId);
    setIsFormDialogOpen(true);
  };

  const handleDetailsClick = (bankDetail: BankDetailType) => {
    setSelectedDetailForDetails(bankDetail);
    setIsDetailsDialogOpen(true);
  };

  const handleDeleteClick = (bankDetailId: string) => {
    setBankDetailToDelete(bankDetailId);
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
        setCsvValidationErrors(result.data.errors || []);
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
      await createBankDetail.mutateAsync(csvData);
      toast.success(`Successfully imported ${csvData.length} bank details`);
      refetch();
      setIsCSVDialogOpen(false);
      setCsvData([]);
      setCsvValidationErrors([]);
      setUploadFile(null);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      toast.error(`Failed to import bank details: ${errorMessage}`);
    }
  };

  const handleFormSuccess = () => {
    refetch();
    setIsFormDialogOpen(false);
  };

  const getContractorName = (contractorId: string) => {
    const contractor = contractors.find(
      (c) => c.contractor_id === contractorId
    );
    return contractor
      ? `${contractor.first_name} ${contractor.last_name}`
      : "Unknown";
  };

  const getBankDetailSections = (): DetailSection[] => {
    if (!selectedDetailForDetails) return [];

    return [
      {
        title: "Bank Information",
        items: [
          { label: "ID", value: selectedDetailForDetails.bank_detail_id },
          {
            label: "Bank Name",
            value: selectedDetailForDetails.bank_name,
          },
          { label: "IBAN", value: selectedDetailForDetails.IBAN },
          { label: "SWIFT", value: selectedDetailForDetails.SWIFT },
          {
            label: "Account Number",
            value: selectedDetailForDetails.account_number,
          },
          { label: "Currency", value: selectedDetailForDetails.currency },
          {
            label: "Bank Detail Type",
            value: selectedDetailForDetails.bank_detail_type,
          },
          {
            label: "Bank Detail Validated",
            value: String(selectedDetailForDetails.bank_detail_validated),
          },
          {
            label: "Last Updated",
            value: new Date(
              selectedDetailForDetails.last_updated
            ).toLocaleString(),
          },
        ],
      },
    ];
  };

  const columns: ColumnDef<BankDetailType>[] = [
    {
      accessorKey: "bank_detail_id",
      header: () => <div className="text-center">ID</div>,
      cell: ({ row }) => (
        <div className="font-medium text-center truncate max-w-[120px] md:max-w-none">
          {row.getValue("bank_detail_id")}
        </div>
      ),
    },
    {
      accessorKey: "contractor_id",
      header: () => <div className="text-center">Contractor</div>,
      cell: ({ row }) => (
        <div className="font-medium text-center truncate max-w-[120px] md:max-w-none">
          {getContractorName(row.getValue("contractor_id"))}
        </div>
      ),
    },
    {
      accessorKey: "bank_name",
      header: () => <div className="text-center">Bank Name</div>,
      cell: ({ row }) => (
        <div className="font-medium text-center truncate max-w-[120px] md:max-w-none">
          {row.getValue("bank_name")}
        </div>
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
            onChange={handleFileChange}
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

      {/* Add/Edit Form Dialog */}
      <BankDetailForm
        bankDetailId={selectedBankDetailId}
        open={isFormDialogOpen}
        onClose={() => setIsFormDialogOpen(false)}
        onSuccess={handleFormSuccess}
      />

      {/* Details Dialog */}
      {selectedDetailForDetails && (
        <DetailsDialog
          title={`Bank Detail – ${selectedDetailForDetails.bank_name}`}
          open={isDetailsDialogOpen}
          onClose={() => setIsDetailsDialogOpen(false)}
          sections={getBankDetailSections()}
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
          title="Import Bank Details"
          description="Review bank details data before import"
        />
      )}

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmationDialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onDelete={deleteDetailMutation.mutateAsync}
        itemId={bankDetailToDelete}
        title="Delete Bank Detail"
        description="Are you sure you want to delete this bank detail? This action cannot be undone and may affect contractor information."
        successMessage="Bank detail deleted successfully"
        errorMessage="Failed to delete bank detail"
      />
    </div>
  );
}
