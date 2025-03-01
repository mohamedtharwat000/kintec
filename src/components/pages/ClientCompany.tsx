"use client";

import { useState } from "react";
import { useClients, useDeleteClient } from "@/hooks/useApp";
import { DataTable } from "@/components/dataTable/Table";
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Plus, Search, Pencil, Trash2, AlertCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { DetailDialog } from "@/components/ui/DetailDialog";
import { ClientForm } from "@/components/forms/ClientCompany";
import type { ClientCompany as ClientCompanyType } from "@/types/ClientCompany";
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

export function ClientCompany() {
  const { data: clients = [], isLoading } = useClients();
  const deleteClient = useDeleteClient();

  const [searchTerm, setSearchTerm] = useState("");
  const [formMode, setFormMode] = useState<"none" | "add" | "edit">("none");
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [clientToDelete, setClientToDelete] = useState<string | null>(null);

  const handleAddClick = () => {
    setSelectedClientId(null);
    setFormMode("add");
  };

  const handleEditClick = (clientId: string) => {
    setSelectedClientId(clientId);
    setFormMode("edit");
  };

  const handleDeleteClick = (clientId: string) => {
    setClientToDelete(clientId);
    setDeleteDialogOpen(true);
  };

  const handleCancelForm = () => {
    setFormMode("none");
  };

  const handleFormSuccess = () => {
    setFormMode("none");
  };

  const handleConfirmDelete = async () => {
    if (!clientToDelete) return;

    try {
      await deleteClient.mutateAsync(clientToDelete);
      toast.success("Company deleted successfully");
    } catch (error) {
      toast.error("Failed to delete company");
    } finally {
      setDeleteDialogOpen(false);
      setClientToDelete(null);
    }
  };

  const columns: ColumnDef<ClientCompanyType>[] = [
    {
      accessorKey: "client_company_id",
      header: "ID",
    },
    {
      accessorKey: "client_name",
      header: "Name",
    },
    {
      accessorKey: "contact_email",
      header: "Email",
    },
    {
      accessorKey: "invoice_submission_deadline",
      header: "Invoice Deadline",
      cell: ({ row }) => {
        const deadline = row.original.invoice_submission_deadline;
        return deadline ? deadline : "N/A";
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
            onClick={() => handleEditClick(row.original.client_company_id)}
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleDeleteClick(row.original.client_company_id)}
          >
            <Trash2 className="h-4 w-4 text-red-500" />
          </Button>
          <DetailDialog data={row.original} title="Company Details" />
        </div>
      ),
    },
  ];

  const filteredData = clients.filter(
    (company) =>
      company.client_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      company.contact_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      company.client_company_id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Show form if in add or edit mode
  if (formMode === "add" || formMode === "edit") {
    return (
      <ClientForm
        clientId={
          formMode === "edit" ? selectedClientId || undefined : undefined
        }
        onCancel={handleCancelForm}
        onSuccess={handleFormSuccess}
      />
    );
  }

  return (
    <div className="p-8">
      <div className="mb-8 flex justify-between items-center">
        <h1 className="text-2xl font-semibold">Company Master Data</h1>
        <Button onClick={handleAddClick}>
          <Plus className="mr-2 h-4 w-4" />
          Add Company
        </Button>
      </div>

      <div className="mb-6 flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
          <Input
            className="pl-10"
            placeholder="Search companies..."
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
              client company and remove all related data.
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
