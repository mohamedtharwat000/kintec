"use client";

import { useState } from "react";
import { useClients, useDeleteClient, useCreateClient } from "@/hooks/useApp";
import { DataTable } from "@/components/dataTable/DataTable";
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Plus, Search, Pencil, Trash2, Upload } from "lucide-react";
import { Input } from "@/components/ui/input";
import { ClientForm } from "@/components/forms/ClientCompany";
import type { ClientCompany as ClientCompanyType } from "@/types/ClientCompany";
import { toast } from "sonner";
import { parseClientCompany } from "@/lib/csv";
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
import { ClientCompanyDetails } from "@/components/detailsDialogs/ClientCompany";
import { CSVPreviewDialog } from "@/components/csvPreviewDialog/ClientCompany";

export function ClientCompany() {
  const { data: clients = [], isLoading } = useClients();
  const deleteClient = useDeleteClient();
  const createClient = useCreateClient();

  const [searchTerm, setSearchTerm] = useState("");
  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [clientToDelete, setClientToDelete] = useState<string | null>(null);

  // CSV upload state
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [csvData, setCsvData] = useState<Partial<ClientCompanyType>[]>([]);
  const [csvFileName, setCsvFileName] = useState("");
  const [validationErrors, setValidationErrors] = useState<
    { row: number; error: string }[]
  >([]);

  const handleAddClick = () => {
    setSelectedClientId(null);
    setIsFormDialogOpen(true);
  };

  const handleEditClick = (clientId: string) => {
    setSelectedClientId(clientId);
    setIsFormDialogOpen(true);
  };

  const handleDeleteClick = (clientId: string) => {
    setClientToDelete(clientId);
    setDeleteDialogOpen(true);
  };

  const handleFormClose = () => {
    setIsFormDialogOpen(false);
  };

  const handleFormSuccess = () => {
    // The form itself will close the dialog
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

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const result = await parseClientCompany(file);
      setCsvFileName(file.name);
      setCsvData(result.data);

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
      await createClient.mutateAsync(csvData);
      toast.success(`Successfully imported ${csvData.length} companies`);
      return Promise.resolve();
    } catch (error) {
      console.error("Error importing CSV data:", error);
      toast.error("Failed to import companies from CSV");
      return Promise.reject(error);
    }
  };

  const columns: ColumnDef<ClientCompanyType>[] = [
    {
      accessorKey: "client_company_id",
      header: "ID",
      cell: ({ row }) => (
        <div className="font-mono text-xs w-32">
          {row.getValue("client_company_id")}
        </div>
      ),
    },
    {
      accessorKey: "client_name",
      header: "Name",
      cell: ({ row }) => (
        <div className="font-medium w-32">{row.getValue("client_name")}</div>
      ),
    },
    {
      accessorKey: "contact_email",
      header: "Email",
      cell: ({ row }) => (
        <a
          href={`mailto:${row.getValue("contact_email")}`}
          className="text-blue-600 hover:underline w-32"
        >
          {row.getValue("contact_email")}
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
          <ClientCompanyDetails company={row.original} />
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

  return (
    <div className="p-8">
      <div className="mb-8 flex justify-between items-center">
        <h1 className="text-2xl font-semibold">Company Master Data</h1>
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
            Add Company
          </Button>
        </div>
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

      {/* Add/Edit Form Dialog */}
      <ClientForm
        clientId={selectedClientId || undefined}
        open={isFormDialogOpen}
        onClose={handleFormClose}
        onSuccess={handleFormSuccess}
      />

      {/* Delete Confirmation Dialog */}
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
