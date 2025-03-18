"use client";

import { useState } from "react";
import {
  useClients,
  useDeleteClient,
  useSearchFilter,
  useParseClientCompanyCsv,
  useCreateClient,
} from "@/hooks/useClientCompany";
import { DataTable } from "@/components/dataTable/DataTable";
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Plus, Search, Pencil, Trash2, Upload, Info } from "lucide-react";
import { Input } from "@/components/ui/input";
import { ClientForm } from "@/components/forms/ClientCompany";
import { ClientCompanyView } from "@/types/ClientCompany";
import { CSVPreviewDialog } from "@/components/reusableModels/CSVPreviewDialog";
import { DeleteConfirmationDialog } from "@/components/reusableModels/DeleteConfirmationDialog";
import {
  DetailsDialog,
  DetailSection,
} from "@/components/reusableModels/DetailsDialog";
import { toast } from "sonner";

export function ClientCompany() {
  // Core data fetching hook
  const { data: clients = [], isLoading, refetch } = useClients();
  const deleteClient = useDeleteClient();
  const createClient = useCreateClient();
  const parseCSV = useParseClientCompanyCsv();

  // Page-level state management
  const [searchTerm, setSearchTerm] = useState("");

  // Form dialog state
  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
  const [selectedClientId, setSelectedClientId] = useState<string>();

  // Details dialog state
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [selectedCompanyForDetails, setSelectedCompanyForDetails] = useState<
    ClientCompanyView | undefined
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
  const [clientToDelete, setClientToDelete] = useState<string | null>(null);

  // Filter data based on search term
  const filteredData = useSearchFilter<ClientCompanyView>(clients, searchTerm, [
    "client_name",
    "contact_email",
    "client_company_id",
  ]);

  // Simple handlers for UI actions
  const handleAddClick = () => {
    setSelectedClientId(undefined);
    setIsFormDialogOpen(true);
  };

  const handleEditClick = (clientId: string) => {
    setSelectedClientId(clientId);
    setIsFormDialogOpen(true);
  };

  const handleDetailsClick = (company: ClientCompanyView) => {
    setSelectedCompanyForDetails(company);
    setIsDetailsDialogOpen(true);
  };

  const handleDeleteClick = (clientId: string) => {
    setClientToDelete(clientId);
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
      await createClient.mutateAsync(csvData);
      toast.success(`Successfully imported ${csvData.length} companies`);
      refetch();
      setIsCSVDialogOpen(false);

      setCsvData([]);
      setCsvValidationErrors([]);
      setUploadFile(null);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      toast.error(`Failed to import companies: ${errorMessage}`);
    }
  };

  const handleFormSuccess = () => {
    refetch();
    setIsFormDialogOpen(false);
  };

  // Generate detail sections for the company
  const getCompanyDetailSections = (): DetailSection[] => {
    if (!selectedCompanyForDetails) return [];

    return [
      {
        title: "Company Information",
        items: [
          { label: "ID", value: selectedCompanyForDetails.client_company_id },
          {
            label: "Company Name",
            value: selectedCompanyForDetails.client_name,
          },
          {
            label: "Contact Email",
            value: (
              <a
                href={`mailto:${selectedCompanyForDetails.contact_email}`}
                className="text-blue-600 hover:underline"
              >
                {selectedCompanyForDetails.contact_email}
              </a>
            ),
          },
          {
            label: "Invoice Submission Deadline",
            value:
              selectedCompanyForDetails.invoice_submission_deadline ||
              "Not specified",
          },
        ],
      },
    ];
  };

  const columns: ColumnDef<ClientCompanyView>[] = [
    {
      accessorKey: "client_company_id",
      header: () => <div className="text-center">Company ID</div>,
      cell: ({ row }) => (
        <div className="font-medium text-center truncate max-w-[120px] md:max-w-none">
          {row.getValue("client_company_id")}
        </div>
      ),
    },
    {
      accessorKey: "client_name",
      header: () => <div className="text-center">Name</div>,
      cell: ({ row }) => (
        <div className="font-medium text-center truncate max-w-[120px] md:max-w-none">
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
          className="block text-blue-600 hover:underline font-medium text-center truncate max-w-[120px] md:max-w-none"
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
    <div className="flex flex-col gap-4 p-4 min-h-full">
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
            onChange={handleFileChange}
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
        clientId={selectedClientId}
        open={isFormDialogOpen}
        onClose={() => setIsFormDialogOpen(false)}
        onSuccess={handleFormSuccess}
      />

      {/* Details Dialog - Using the reusable component */}
      {selectedCompanyForDetails && (
        <DetailsDialog
          title={selectedCompanyForDetails.client_name}
          open={isDetailsDialogOpen}
          onClose={() => setIsDetailsDialogOpen(false)}
          sections={getCompanyDetailSections()}
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
          title="Import Companies"
          description="Review company data before import"
        />
      )}

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmationDialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onDelete={deleteClient.mutateAsync}
        itemId={clientToDelete}
        title="Delete Company"
        description="Are you sure you want to delete this company? This action cannot be undone."
        successMessage="Company deleted successfully"
        errorMessage="Failed to delete company"
      />
    </div>
  );
}
