"use client";

import { useState } from "react";
import { useContractors, useDeleteContractor } from "@/hooks/useApp";
import { DataTable } from "@/components/dataTable/Table";
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Plus, Search, Pencil, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { DetailDialog } from "@/components/ui/DetailDialog";
import { ContractorForm } from "@/components/forms/ContractorForm";
import { toast } from "sonner";
import type { Contractor as ContractorType } from "@/types/contractor";
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

export function Contractor() {
  const { data: contractors = [], isLoading } = useContractors();
  const deleteContractor = useDeleteContractor();

  const [searchTerm, setSearchTerm] = useState("");
  const [formMode, setFormMode] = useState<"none" | "add" | "edit">("none");
  const [selectedContractorId, setSelectedContractorId] = useState<
    string | null
  >(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [contractorToDelete, setContractorToDelete] = useState<string | null>(
    null
  );

  const handleAddClick = () => {
    setSelectedContractorId(null);
    setFormMode("add");
  };

  const handleEditClick = (contractorId: string) => {
    setSelectedContractorId(contractorId);
    setFormMode("edit");
  };

  const handleDeleteClick = (contractorId: string) => {
    setContractorToDelete(contractorId);
    setDeleteDialogOpen(true);
  };

  const handleCancelForm = () => {
    setFormMode("none");
  };

  const handleFormSuccess = () => {
    setFormMode("none");
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

  const columns: ColumnDef<ContractorType>[] = [
    {
      accessorKey: "contractor_id",
      header: "ID",
    },
    {
      accessorFn: (row) => `${row.first_name} ${row.last_name}`,
      header: "Name",
    },
    {
      accessorKey: "email_address",
      header: "Email",
    },
    {
      accessorKey: "phone_number",
      header: "Phone",
    },
    {
      accessorKey: "nationality",
      header: "Nationality",
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
          <DetailDialog
            data={row.original}
            title="Contractor Details"
            excludeFields={[
              "contracts",
              "submissions",
              "bank_details",
              "visa_details",
            ]}
          />
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

  // Show form if in add or edit mode
  if (formMode === "add" || formMode === "edit") {
    return (
      <ContractorForm
        contractorId={
          formMode === "edit" ? selectedContractorId || undefined : undefined
        }
        onCancel={handleCancelForm}
        onSuccess={handleFormSuccess}
      />
    );
  }

  return (
    <div className="p-8">
      <div className="mb-8 flex justify-between items-center">
        <h1 className="text-2xl font-semibold">Contractor Master Data</h1>
        <Button onClick={handleAddClick}>
          <Plus className="mr-2 h-4 w-4" />
          Add Contractor
        </Button>
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
    </div>
  );
}
