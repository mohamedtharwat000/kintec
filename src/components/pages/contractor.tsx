"use client";

import { useState } from "react";
import {
  useContractors,
  useDeleteContractor,
  useCreateContractor,
} from "@/hooks/useApp";
import { DataTable } from "@/components/dataTable/DataTable";
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Plus, Search, Pencil, Trash2, Upload } from "lucide-react";
import { Input } from "@/components/ui/input";
import { ContractorForm } from "@/components/forms/Contractor";
import { toast } from "sonner";
import type { Contractor as ContractorType } from "@/types/Contractor";
import { parseContractor } from "@/lib/csv";
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

  // CSV upload state
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [csvData, setCsvData] = useState<Partial<ContractorType>[]>([]);
  const [csvDataToUpload, setCsvDataToUpload] = useState<
    Partial<ContractorType>[]
  >([]);
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

  const handleDeleteClick = (contractorId: string) => {
    setContractorToDelete(contractorId);
    setDeleteDialogOpen(true);
  };

  const handleFormClose = () => {
    setIsFormDialogOpen(false);
  };

  const handleFormSuccess = () => {
    // The form itself will handle success actions
  };

  const handleConfirmDelete = async () => {
    if (!contractorToDelete) return;

    try {
      await deleteContractor.mutateAsync(contractorToDelete);
      toast.success("Contractor deleted successfully");
    } catch (error) {
      toast.error("Failed to delete contractor");
    } finally {
      setDeleteDialogOpen(false);
      setContractorToDelete(null);
    }
  };

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const result = await parseContractor(file);
      setCsvFileName(file.name);
      setCsvData(result.data);
      setCsvDataToUpload(
        (result.dataToUpload as Partial<ContractorType>[]) || []
      );

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
      await createContractor.mutateAsync(csvDataToUpload);
      toast.success(
        `Successfully imported ${csvDataToUpload.length} contractors`
      );
      setCsvData([]);
      setCsvDataToUpload([]);
      setCsvFileName("");
    } catch (error) {
      console.error("Error importing CSV data:", error);
      toast.error("Failed to import contractors from CSV");
      return Promise.reject(error);
    }
  };

  const columns: ColumnDef<ContractorType>[] = [
    {
      accessorKey: "contractor_id",
      header: "ID",
      cell: ({ row }) => (
        <div className="font-mono text-xs w-32">
          {row.getValue("contractor_id")}
        </div>
      ),
    },
    {
      accessorFn: (row) => `${row.first_name} ${row.last_name}`,
      header: "Name",
      cell: ({ row }) => (
        <div className="font-medium w-32">
          {`${row.original.first_name} ${row.original.last_name}`}
        </div>
      ),
    },
    {
      accessorKey: "email_address",
      header: "Email",
      cell: ({ row }) => (
        <a
          href={`mailto:${row.getValue("email_address")}`}
          className="text-blue-600 hover:underline w-32"
        >
          {row.getValue("email_address")}
        </a>
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
          <ContractorDetails contractor={row.original} />
        </div>
      ),
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
    <div className="p-8">
      <div className="mb-8 flex justify-between items-center">
        <h1 className="text-2xl font-semibold">Contractor Master Data</h1>
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
            Add Contractor
          </Button>
        </div>
      </div>

      <div className="mb-6 flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
          <Input
            className="pl-10"
            placeholder="Search contractors..."
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
              This action cannot be undone. This will permanently delete the
              contractor and remove all related data.
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
      <ContractorForm
        contractorId={selectedContractorId || undefined}
        open={isFormDialogOpen}
        onClose={handleFormClose}
        onSuccess={handleFormSuccess}
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
    </div>
  );
}
