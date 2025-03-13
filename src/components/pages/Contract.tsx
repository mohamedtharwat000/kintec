"use client";

import { useState } from "react";
import {
  useContracts,
  useDeleteContract,
  useCreateContract,
} from "@/hooks/useContracts";
import { DataTable } from "@/components/dataTable/DataTable";
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Plus, Search, Pencil, Trash2, Upload, Info } from "lucide-react";
import { Input } from "@/components/ui/input";
import { ContractForm } from "@/components/forms/Contract";
import { Badge } from "@/components/ui/badge";
import type { Contract as ContractType } from "@/types/Contract";
import { toast } from "sonner";
import { parseContract } from "@/lib/csv/contract";
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
import { ContractDetails } from "@/components/detailsDialogs/Contract";
import { CSVPreviewDialog } from "@/components/csvPreviewDialog/Contract";
import { tryCatch } from "@/lib/utils";

export function Contract() {
  const { data: contracts = [], isLoading } = useContracts();
  const deleteContract = useDeleteContract();
  const createContract = useCreateContract();

  const [searchTerm, setSearchTerm] = useState("");
  const filteredData = contracts.filter(
    (contract) =>
      contract.job_title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contract.job_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (contract.contractor?.last_name || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      (contract.client_company?.client_name || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
  );

  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
  const [selectedContractId, setSelectedContractId] = useState<string | null>(
    null
  );
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [contractToDelete, setContractToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [selectedContractForDetails, setSelectedContractForDetails] = useState<
    ContractType | undefined
  >(undefined);

  // CSV upload state
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [csvData, setCsvData] = useState<Partial<ContractType>[]>([]);
  const [csvFileName, setCsvFileName] = useState("");
  const [validationErrors, setValidationErrors] = useState<
    { row: number; error: string }[]
  >([]);

  const handleAddClick = () => {
    setSelectedContractId(null);
    setIsFormDialogOpen(true);
  };

  const handleEditClick = (contractId: string) => {
    setSelectedContractId(contractId);
    setIsFormDialogOpen(true);
  };

  const handleDetailsClick = (contract: ContractType) => {
    setSelectedContractForDetails(contract);
    setIsDetailsDialogOpen(true);
  };

  const handleDeleteClick = (contractId: string) => {
    setContractToDelete(contractId);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!contractToDelete) return;

    setIsDeleting(true);
    const { error } = await tryCatch(() =>
      deleteContract.mutateAsync(contractToDelete)
    );

    if (error) {
      toast.error("Failed to delete contract: " + error.message);
    } else {
      toast.success("Contract deleted successfully");
    }

    setIsDeleting(false);
    setDeleteDialogOpen(false);
    setContractToDelete(null);
  };

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const { data, error } = await tryCatch(() => parseContract(file));

    if (error) {
      toast.error("Failed to parse CSV file: " + error.message);
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
      return Promise.reject(new Error("Validation errors exist"));
    }

    const { error } = await tryCatch(() => createContract.mutateAsync(csvData));

    if (error) {
      toast.error("Failed to import contracts from CSV: " + error.message);
      return Promise.reject(error);
    }

    toast.success(`Successfully imported ${csvData.length} contracts`);
    setIsPreviewOpen(false);
    return Promise.resolve();
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const columns: ColumnDef<ContractType>[] = [
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
            onChange={handleFileUpload}
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
        contractId={selectedContractId || undefined}
        open={isFormDialogOpen}
        onClose={() => {
          setIsFormDialogOpen(false);
        }}
      />

      {/* Details Dialog */}
      <ContractDetails
        contract={selectedContractForDetails}
        open={isDetailsDialogOpen}
        onClose={() => setIsDetailsDialogOpen(false)}
      />

      {/* CSV Preview Dialog */}
      <CSVPreviewDialog
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        data={csvData}
        fileName={csvFileName}
        onConfirm={handleConfirmCsvUpload}
        validationErrors={validationErrors}
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
              contract and remove all related data.
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
    </div>
  );
}
