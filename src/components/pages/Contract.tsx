"use client";

import { useState } from "react";
import {
  useContracts,
  useDeleteContract,
  useCreateContract,
  useSearchFilter,
  useParseContractCsv,
} from "@/hooks/useContracts";
import { DataTable } from "@/components/dataTable/DataTable";
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Plus, Search, Pencil, Trash2, Upload, Info } from "lucide-react";
import { Input } from "@/components/ui/input";
import { ContractForm } from "@/components/forms/Contract";
import { Badge } from "@/components/ui/badge";
import type { ContractView } from "@/types/ContractType";
import { toast } from "sonner";
import { CSVPreviewDialog } from "@/components/reusableModels/CSVPreviewDialog";
import { DeleteConfirmationDialog } from "@/components/reusableModels/DeleteConfirmationDialog";
import {
  DetailsDialog,
  DetailSection,
} from "@/components/reusableModels/DetailsDialog";

export function Contract() {
  // Core data fetching hook
  const { data: contracts = [], isLoading, refetch } = useContracts();
  const deleteContract = useDeleteContract();
  const createContract = useCreateContract();
  const parseCSV = useParseContractCsv();

  // Page-level state management
  const [searchTerm, setSearchTerm] = useState("");

  // Form dialog state
  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
  const [selectedContractId, setSelectedContractId] = useState<string>();

  // Details dialog state
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [selectedContractForDetails, setSelectedContractForDetails] = useState<
    ContractView | undefined
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
  const [contractToDelete, setContractToDelete] = useState<string | null>(null);

  // Filter data based on search term
  const filteredData = useSearchFilter<ContractView>(contracts, searchTerm, [
    "job_title",
    "job_number",
    "contract_id",
  ]);

  // Simple handlers for UI actions
  const handleAddClick = () => {
    setSelectedContractId(undefined);
    setIsFormDialogOpen(true);
  };

  const handleEditClick = (contractId: string) => {
    setSelectedContractId(contractId);
    setIsFormDialogOpen(true);
  };

  const handleDetailsClick = (contract: ContractView) => {
    setSelectedContractForDetails(contract);
    setIsDetailsDialogOpen(true);
  };

  const handleDeleteClick = (contractId: string) => {
    setContractToDelete(contractId);
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
      await createContract.mutateAsync(csvData);
      toast.success(`Successfully imported ${csvData.length} contracts`);
      refetch();
      setIsCSVDialogOpen(false);
      setCsvData([]);
      setCsvValidationErrors([]);
      setUploadFile(null);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      toast.error(`Failed to import contracts: ${errorMessage}`);
    }
  };

  const handleFormSuccess = () => {
    refetch();
    setIsFormDialogOpen(false);
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getContractDetailSections = (): DetailSection[] => {
    if (!selectedContractForDetails) return [];

    return [
      {
        title: "Contract Information",
        items: [
          {
            label: "Contract ID",
            value: selectedContractForDetails.contract_id,
          },
          { label: "Job Title", value: selectedContractForDetails.job_title },
          { label: "Job Number", value: selectedContractForDetails.job_number },
          { label: "Job Type", value: selectedContractForDetails.job_type },
          {
            label: "Contract Start Date",
            value: formatDate(selectedContractForDetails.contract_start_date),
          },
          {
            label: "Contract End Date",
            value: formatDate(selectedContractForDetails.contract_end_date),
          },
          {
            label: "Contract Status",
            value: selectedContractForDetails.contract_status,
          },
          {
            label: "Kintec Cost Centre Code",
            value: selectedContractForDetails.kintec_cost_centre_code,
          },
          {
            label: "Description of Services",
            value: selectedContractForDetails.description_of_services || "N/A",
          },
        ],
      },
      {
        title: "Client & Contractor Information",
        items: [
          {
            label: "Contractor",
            value: selectedContractForDetails.contractor
              ? `${selectedContractForDetails.contractor.first_name} ${selectedContractForDetails.contractor.last_name}`
              : "N/A",
          },
          {
            label: "Client Company",
            value: selectedContractForDetails.client_company
              ? selectedContractForDetails.client_company.client_name
              : "N/A",
          },
        ],
      },
    ];
  };

  const columns: ColumnDef<ContractView>[] = [
    {
      accessorKey: "job_title",
      header: () => <div className="text-center">Job Title</div>,
      cell: ({ row }) => (
        <div className="font-medium truncate max-w-[120px] md:max-w-none">
          {row.getValue("job_title")}
        </div>
      ),
    },
    {
      accessorKey: "job_number",
      header: () => <div className="text-center">Job Number</div>,
      cell: ({ row }) => (
        <div className="truncate max-w-[100px] md:max-w-none">
          {row.getValue("job_number")}
        </div>
      ),
    },
    {
      accessorKey: "contract_status",
      header: () => <div className="text-center">Status</div>,
      cell: ({ row }) => {
        const status = row.getValue("contract_status") as string;
        const colorMap: Record<string, string> = {
          active: "bg-green-500",
          expired: "bg-gray-500",
          terminated: "bg-red-500",
        };

        return (
          <Badge
            className={`${colorMap[status] || "bg-blue-500"} hover:${
              colorMap[status] || "bg-blue-500"
            }`}
          >
            {status}
          </Badge>
        );
      },
    },
    {
      accessorKey: "contract_start_date",
      header: () => <div className="text-center">Start Date</div>,
      cell: ({ row }) => {
        return <div>{formatDate(row.getValue("contract_start_date"))}</div>;
      },
    },
    {
      accessorKey: "contract_end_date",
      header: () => <div className="text-center">End Date</div>,
      cell: ({ row }) => {
        return <div>{formatDate(row.getValue("contract_end_date"))}</div>;
      },
    },
    {
      accessorKey: "contractor",
      header: () => <div className="text-center">Contractor</div>,
      cell: ({ row }) => {
        const contractor = row.original.contractor;
        return (
          <div className="truncate max-w-[120px] md:max-w-none">
            {contractor
              ? `${contractor.first_name} ${contractor.last_name}`
              : "None"}
          </div>
        );
      },
    },
    {
      accessorKey: "client_company",
      header: () => <div className="text-center">Client Company</div>,
      cell: ({ row }) => {
        const company = row.original.client_company;
        return (
          <div className="truncate max-w-[120px] md:max-w-none">
            {company ? company.client_name : "None"}
          </div>
        );
      },
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
              onClick={() => handleEditClick(row.original.contract_id)}
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleDeleteClick(row.original.contract_id)}
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
      <h1 className="text-xl sm:text-2xl font-semibold">Contract Management</h1>
      <div className="flex flex-wrap justify-between items-center gap-2">
        <div className="relative flex flex-1 items-center gap-2">
          <Button
            size="sm"
            className="w-full sm:w-auto"
            onClick={handleAddClick}
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Contract
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
            placeholder="Search contracts..."
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
      <ContractForm
        contractId={selectedContractId}
        open={isFormDialogOpen}
        onClose={() => setIsFormDialogOpen(false)}
        onSuccess={handleFormSuccess}
      />

      {/* Details Dialog */}
      {selectedContractForDetails && (
        <DetailsDialog
          title={`Contract - ${selectedContractForDetails.job_title}`}
          open={isDetailsDialogOpen}
          onClose={() => setIsDetailsDialogOpen(false)}
          sections={getContractDetailSections()}
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
          title="Import Contracts"
          description="Review contract data before import"
        />
      )}

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmationDialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onDelete={deleteContract.mutateAsync}
        itemId={contractToDelete}
        title="Delete Contract"
        description="Are you sure you want to delete this contract? This action cannot be undone."
        successMessage="Contract deleted successfully"
        errorMessage="Failed to delete contract"
      />
    </div>
  );
}
