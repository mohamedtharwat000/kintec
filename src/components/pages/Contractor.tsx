"use client";

import { useState } from "react";
import {
  useContractors,
  useDeleteContractor,
  useCreateContractor,
  useParseContractorCsv,
  useSearchFilter,
} from "@/hooks/useContractor";
import { DataTable } from "@/components/dataTable/DataTable";
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Plus, Search, Pencil, Trash2, Upload, Info } from "lucide-react";
import { Input } from "@/components/ui/input";
import { ContractorForm } from "@/components/forms/Contractor";
import { toast } from "sonner";
import type { Contractor as ContractorType } from "@/types/ContractorType";
import { CSVPreviewDialog } from "@/components/reusableModels/CSVPreviewDialog";
import { DeleteConfirmationDialog } from "@/components/reusableModels/DeleteConfirmationDialog";
import {
  DetailsDialog,
  DetailSection,
} from "@/components/reusableModels/DetailsDialog";
import { tryCatch } from "@/lib/utils";

export function Contractor() {
  // Core data fetching hook
  const { data: contractors = [], isLoading, refetch } = useContractors();
  const deleteContractor = useDeleteContractor();
  const createContractor = useCreateContractor();
  const parseCSV = useParseContractorCsv();

  // Page-level state management
  const [searchTerm, setSearchTerm] = useState("");

  // Form dialog state
  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
  const [selectedContractorId, setSelectedContractorId] = useState<string>();

  // Details dialog state
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [selectedContractorForDetails, setSelectedContractorForDetails] =
    useState<ContractorType | undefined>(undefined);

  // CSV dialog state
  const [isCSVDialogOpen, setIsCSVDialogOpen] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [csvData, setCsvData] = useState<any[]>([]);
  const [csvValidationErrors, setCsvValidationErrors] = useState<
    { row: number; error: string }[]
  >([]);

  // Delete dialog state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [contractorToDelete, setContractorToDelete] = useState<string | null>(
    null
  );

  // Filter data based on search term
  const filteredData = useSearchFilter<ContractorType>(
    contractors,
    searchTerm,
    [
      "first_name",
      "last_name",
      "email_address",
      "contractor_id",
      "phone_number",
    ]
  );

  // Simple handlers for UI actions
  const handleAddClick = () => {
    setSelectedContractorId(undefined);
    setIsFormDialogOpen(true);
  };

  const handleEditClick = (contractorId: string) => {
    setSelectedContractorId(contractorId);
    setIsFormDialogOpen(true);
  };

  const handleDetailsClick = (contractor: ContractorType) => {
    setSelectedContractorForDetails(contractor);
    setIsDetailsDialogOpen(true);
  };

  const handleDeleteClick = (contractorId: string) => {
    setContractorToDelete(contractorId);
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
      await createContractor.mutateAsync(csvData);
      toast.success(`Successfully imported ${csvData.length} contractors`);
      refetch();
      setIsCSVDialogOpen(false);
      setCsvData([]);
      setCsvValidationErrors([]);
      setUploadFile(null);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      toast.error(`Failed to import contractors: ${errorMessage}`);
    }
  };

  const handleFormSuccess = () => {
    refetch();
    setIsFormDialogOpen(false);
  };

  // Format date for display
  const formatDate = (date: Date | string | undefined) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Generate detail sections for the contractor
  const getContractorDetailSections = (): DetailSection[] => {
    if (!selectedContractorForDetails) return [];

    return [
      {
        title: "Personal Information",
        items: [
          { label: "ID", value: selectedContractorForDetails.contractor_id },
          {
            label: "Full Name",
            value: `${selectedContractorForDetails.first_name} ${selectedContractorForDetails.middle_name ? selectedContractorForDetails.middle_name + " " : ""}${selectedContractorForDetails.last_name}`,
          },
          {
            label: "Date of Birth",
            value: formatDate(selectedContractorForDetails.date_of_birth),
          },
          {
            label: "Email Address",
            value: (
              <a
                href={`mailto:${selectedContractorForDetails.email_address}`}
                className="text-blue-600 hover:underline"
              >
                {selectedContractorForDetails.email_address}
              </a>
            ),
          },
          {
            label: "Phone Number",
            value: selectedContractorForDetails.phone_number,
          },
          {
            label: "Nationality",
            value: selectedContractorForDetails.nationality,
          },
          {
            label: "Country of Residence",
            value: selectedContractorForDetails.country_of_residence,
          },
          {
            label: "Address",
            value: selectedContractorForDetails.address,
            colSpan: 2,
          },
        ],
      },
    ];
  };

  const columns: ColumnDef<ContractorType>[] = [
    {
      accessorKey: "contractor_id",
      header: () => <div className="text-center">ID</div>,
      cell: ({ row }) => (
        <div className="font-medium text-center truncate max-w-[120px] md:max-w-none">
          {row.getValue("contractor_id")}
        </div>
      ),
    },
    {
      id: "name",
      accessorFn: (row) => `${row.first_name} ${row.last_name}`,
      header: () => <div className="text-center">Name</div>,
      cell: ({ row }) => (
        <div className="font-medium text-center truncate max-w-[120px] md:max-w-none">
          {`${row.original.first_name} ${row.original.last_name}`}
        </div>
      ),
    },
    {
      accessorKey: "email_address",
      header: () => <div className="text-center">Email</div>,
      cell: ({ row }) => (
        <a
          href={`mailto:${row.getValue("email_address")}`}
          className="block text-blue-600 hover:underline font-medium text-center truncate max-w-[120px] md:max-w-none"
        >
          {row.getValue("email_address")}
        </a>
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
              onClick={() => handleEditClick(row.original.contractor_id)}
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleDeleteClick(row.original.contractor_id)}
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
        Contractor Master Data
      </h1>
      <div className="flex flex-wrap justify-between items-center gap-2">
        <div className="relative flex flex-1 items-center gap-2">
          <Button
            size="sm"
            className="w-full sm:w-auto"
            onClick={handleAddClick}
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Contractor
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
            placeholder="Search contractors..."
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
      <ContractorForm
        contractorId={selectedContractorId}
        open={isFormDialogOpen}
        onClose={() => {
          setIsFormDialogOpen(false);
        }}
        onSuccess={handleFormSuccess}
      />

      {/* Details Dialog - Using the reusable component */}
      {selectedContractorForDetails && (
        <DetailsDialog
          title={`${selectedContractorForDetails.first_name} ${selectedContractorForDetails.last_name}`}
          open={isDetailsDialogOpen}
          onClose={() => setIsDetailsDialogOpen(false)}
          sections={getContractorDetailSections()}
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
          title="Import Contractors"
          description="Review contractor data before import"
        />
      )}

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmationDialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onDelete={deleteContractor.mutateAsync}
        itemId={contractorToDelete}
        title="Delete Contractor"
        description="Are you sure you want to delete this contractor? This action cannot be undone and will remove all related data."
        successMessage="Contractor deleted successfully"
        errorMessage="Failed to delete contractor"
      />
    </div>
  );
}
