"use client";

import { useState } from "react";
import { useContracts, useDeleteContract } from "@/hooks/useApp";
import { DataTable } from "@/components/dataTable/Table";
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Plus, Search, Pencil, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { DetailDialog } from "@/components/ui/DetailDialog";
import { ContractForm } from "@/components/forms/ContractForm";
import { toast } from "sonner";
import { format } from "date-fns";
import type {
  Contract as ContractType,
  ContractStatus,
} from "@/types/contract";
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

export function Contract() {
  const { data: contracts = [], isLoading } = useContracts();
  const deleteContract = useDeleteContract();

  const [searchTerm, setSearchTerm] = useState("");
  const [formMode, setFormMode] = useState<"none" | "add" | "edit">("none");
  const [selectedContractId, setSelectedContractId] = useState<string | null>(
    null
  );
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [contractToDelete, setContractToDelete] = useState<string | null>(null);

  const handleAddClick = () => {
    setSelectedContractId(null);
    setFormMode("add");
  };

  const handleEditClick = (contractId: string) => {
    setSelectedContractId(contractId);
    setFormMode("edit");
  };

  const handleDeleteClick = (contractId: string) => {
    setContractToDelete(contractId);
    setDeleteDialogOpen(true);
  };

  const handleCancelForm = () => {
    setFormMode("none");
  };

  const handleFormSuccess = () => {
    setFormMode("none");
  };

  const handleConfirmDelete = async () => {
    if (!contractToDelete) return;

    try {
      await deleteContract.mutateAsync(contractToDelete);
      toast.success("Contract deleted successfully");
    } catch (error) {
      toast.error("Failed to delete contract");
    } finally {
      setDeleteDialogOpen(false);
      setContractToDelete(null);
    }
  };

  const columns: ColumnDef<ContractType>[] = [
    {
      accessorKey: "contract_id",
      header: "Contract ID",
    },
    {
      accessorKey: "job_title",
      header: "Job Title",
    },
    {
      accessorFn: (row) =>
        row.contract_start_date instanceof Date
          ? format(row.contract_start_date, "dd/MM/yyyy")
          : format(new Date(row.contract_start_date), "dd/MM/yyyy"),
      header: "Start Date",
    },
    {
      accessorFn: (row) =>
        row.contract_end_date instanceof Date
          ? format(row.contract_end_date, "dd/MM/yyyy")
          : format(new Date(row.contract_end_date), "dd/MM/yyyy"),
      header: "End Date",
    },
    {
      accessorKey: "contract_status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.original.contract_status as ContractStatus;
        return (
          <div
            className={`
            px-2 py-1 rounded-full text-xs font-medium inline-block
            ${
              status === "active"
                ? "bg-green-100 text-green-800"
                : status === "expired"
                ? "bg-gray-100 text-gray-800"
                : "bg-red-100 text-red-800"
            }
          `}
          >
            {status}
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
          <DetailDialog
            data={row.original}
            title="Contract Details"
            excludeFields={[
              "contractor",
              "client_company",
              "project",
              "purchase_order",
              "calloff_work_orders",
            ]}
          />
        </div>
      ),
    },
  ];

  const filteredData = contracts.filter(
    (contract) =>
      contract.contract_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contract.job_title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contract.job_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contract.contract_status.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Show form if in add or edit mode
  if (formMode === "add" || formMode === "edit") {
    return (
      <ContractForm
        contractId={
          formMode === "edit" ? selectedContractId || undefined : undefined
        }
        onCancel={handleCancelForm}
        onSuccess={handleFormSuccess}
      />
    );
  }

  return (
    <div className="p-8">
      <div className="mb-8 flex justify-between items-center">
        <h1 className="text-2xl font-semibold">Contract Master Data</h1>
        <Button onClick={handleAddClick}>
          <Plus className="mr-2 h-4 w-4" />
          Add Contract
        </Button>
      </div>

      <div className="mb-6 flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
          <Input
            className="pl-10"
            placeholder="Search contracts..."
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
              contract and remove all related data.
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
