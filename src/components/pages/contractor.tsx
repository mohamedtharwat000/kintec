"use client";

import { useState } from "react";
import {
  useContractors,
  useDeleteContractor,
  useCreateContractor,
} from "@/hooks/useContractor";
import { DataTable } from "@/components/dataTable/DataTable";
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Plus, Search, Pencil, Trash2, Upload, Info } from "lucide-react";
import { Input } from "@/components/ui/input";
import { ContractorForm } from "@/components/forms/Contractor";
import { toast } from "sonner";
import type { Contractor as ContractorType } from "@/types/Contractor";
import { parseContractor } from "@/lib/csv/contractor";
import { validateContractors } from "@/lib/validation/contractor";
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
import { ContractorDetails } from "@/components/detailsDialogs/Contractor";
import { CSVPreviewDialog } from "@/components/csvPreviewDialog/Contractor";
import { tryCatch } from "@/lib/utils";

export function Contractor() {
  const { data: contractors = [], isLoading } = useContractors();
  const deleteContractor = useDeleteContractor();
  const createContractor = useCreateContractor();

  const [searchTerm, setSearchTerm] = useState("");
  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
  const [selectedContractorId, setSelectedContractorId] = useState<
    string | null
  >(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [contractorToDelete, setContractorToDelete] = useState<string | null>(
    null
  );
  const [isDeleting, setIsDeleting] = useState(false);

  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [selectedContractorForDetails, setSelectedContractorForDetails] =
    useState<ContractorType | undefined>(undefined);

  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [csvData, setCsvData] = useState<Partial<ContractorType>[]>([]);
  const [csvFileName, setCsvFileName] = useState("");
  const [validationErrors, setValidationErrors] = useState<
    { row: number; error: string }[]
  >([]);

  const handleAddClick = () => {
    setSelectedContractorId(null);
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

  const handleConfirmDelete = async () => {
    if (!contractorToDelete) return;

    setIsDeleting(true);
    const { error } = await tryCatch(() =>
      deleteContractor.mutateAsync(contractorToDelete)
    );

    if (error) {
      toast.error("Failed to delete contractor: " + error.message);
    } else {
      toast.success("Contractor deleted successfully");
    }

    setIsDeleting(false);
    setDeleteDialogOpen(false);
    setContractorToDelete(null);
  };

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const { data, error } = await tryCatch(() => parseContractor(file));

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
      createContractor.mutateAsync(csvData)
    );

    if (error) {
      toast.error("Failed to import contractors from CSV: " + error.message);
    } else {
      toast.success(`Successfully imported ${csvData.length} contractors`);
      setIsPreviewOpen(false);
      setCsvData([]);
      setCsvFileName("");
    }
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

  const filteredData = contractors.filter(
    (contractor) =>
      contractor.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contractor.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contractor.email_address
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      contractor.contractor_id
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      contractor.phone_number.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
            onChange={handleFileUpload}
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
        contractorId={selectedContractorId || undefined}
        open={isFormDialogOpen}
        onClose={() => {
          setIsFormDialogOpen(false);
        }}
      />

      {/* Details Dialog */}
      <ContractorDetails
        contractor={selectedContractorForDetails}
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
              contractor and remove all related data.
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
