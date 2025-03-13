"use client";

import { useState } from "react";
import {
  useClients,
  useDeleteClient,
  useCreateClient,
} from "@/hooks/useClientCompany";
import { DataTable } from "@/components/dataTable/DataTable";
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Plus, Search, Pencil, Trash2, Upload, Info } from "lucide-react";
import { Input } from "@/components/ui/input";
import { ClientForm } from "@/components/forms/ClientCompany";
import type { ClientCompany as ClientCompanyType } from "@/types/ClientCompany";
import { toast } from "sonner";
import { parseClientCompany } from "@/lib/csv/clientCompany";
import { validateClientCompanies } from "@/lib/validation/clientCompany";
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
import { tryCatch } from "@/lib/utils";

export function ClientCompany() {
  const { data: clients = [], isLoading } = useClients();

  const deleteClient = useDeleteClient();
  const createClient = useCreateClient();

  const [searchTerm, setSearchTerm] = useState("");
  const filteredData = clients.filter(
    (company) =>
      company.client_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      company.contact_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      company.client_company_id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [clientToDelete, setClientToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [selectedCompanyForDetails, setSelectedCompanyForDetails] = useState<
    ClientCompanyType | undefined
  >(undefined);

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

  const handleDetailsClick = (company: ClientCompanyType) => {
    setSelectedCompanyForDetails(company);
    setIsDetailsDialogOpen(true);
  };

  const handleDeleteClick = (clientId: string) => {
    setClientToDelete(clientId);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!clientToDelete) return;

    setIsDeleting(true);
    const { error } = await tryCatch(() =>
      deleteClient.mutateAsync(clientToDelete)
    );

    if (error) {
      toast.error("Failed to delete company" + error.message);
    } else {
      toast.success("Company deleted successfully");
    }

    setIsDeleting(false);
    setDeleteDialogOpen(false);
    setClientToDelete(null);
  };

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const { data, error } = await tryCatch(() => parseClientCompany(file));

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
  };

  const handleConfirmCsvUpload = async () => {
    if (validationErrors.length > 0) {
      toast.error("Please fix validation errors before uploading");
      return;
    }

    const { error } = await tryCatch(() => createClient.mutateAsync(csvData));

    if (error) {
      toast.error("Failed to import companies from CSV: " + error.message);
    } else {
      toast.success(`Successfully imported ${csvData.length} companies`);
      setIsPreviewOpen(false);
    }
  };

  const columns: ColumnDef<ClientCompanyType>[] = [
    {
      accessorKey: "client_company_id",
      header: () => <div className="text-center">Company ID</div>,
      cell: ({ row }) => (
        <div className="font-mono text-xs truncate !max-w-[100px] md:max-w-none">
          {row.getValue("client_company_id")}
        </div>
      ),
    },
    {
      accessorKey: "client_name",
      header: () => <div className="text-center">Name</div>,
      cell: ({ row }) => (
        <div className="font-medium truncate max-w-[120px] md:max-w-none">
          {row.getValue("client_name")}
        </div>
      ),
    },
    {
      accessorKey: "contact_email",
      header: () => <div className="text-center">Email</div>,
      cell: ({ row }) => (
        <a
          href={`mailto:${row.getValue("contact_email")}`}
          className="text-blue-600 hover:underline truncate block max-w-[150px] md:max-w-none"
        >
          {row.getValue("contact_email")}
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
      <h1 className="text-xl sm:text-2xl font-semibold">Company Master Data</h1>
      <div className="flex flex-wrap justify-between items-center gap-2">
        <div className="relative flex flex-1 items-center gap-2">
          <Button
            size="sm"
            className="w-full sm:w-auto"
            onClick={handleAddClick}
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Company
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
            placeholder="Search companies..."
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
      <ClientForm
        clientId={selectedClientId || undefined}
        open={isFormDialogOpen}
        onClose={() => {
          setIsFormDialogOpen(false);
        }}
      />

      {/* Details Dialog */}
      <ClientCompanyDetails
        company={selectedCompanyForDetails}
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
              client company and remove all related data.
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
