"use client";

import { useState } from "react";
import {
  useVisaDetails,
  useDeleteVisaDetail,
  useCreateVisaDetail,
  useParseVisaDetailCsv,
  useSearchFilter,
} from "@/hooks/useVisaDetail";
import { useContractors } from "@/hooks/useContractor";
import { DataTable } from "@/components/dataTable/DataTable";
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Plus, Search, Pencil, Trash2, Upload, Info } from "lucide-react";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { VisaDetailForm } from "@/components/forms/VisaDetailForm";
import { CSVPreviewDialog } from "@/components/reusableModels/CSVPreviewDialog";
import { DeleteConfirmationDialog } from "@/components/reusableModels/DeleteConfirmationDialog";
import { Badge } from "@/components/ui/badge";
import { tryCatch } from "@/lib/utils";
import type { VisaDetail as VisaDetailType } from "@/types/VisaDetail";
import {
  DetailsDialog,
  DetailSection,
} from "@/components/reusableModels/DetailsDialog";

export function VisaDetail() {
  // Core data fetching hook
  const { data: visaDetails = [], isLoading, refetch } = useVisaDetails();
  const { data: contractors = [] } = useContractors();
  const deleteVisaDetail = useDeleteVisaDetail();
  const createVisaDetail = useCreateVisaDetail();
  const parseCSV = useParseVisaDetailCsv();

  // Page-level state management
  const [searchTerm, setSearchTerm] = useState("");

  // Form dialog state
  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
  const [selectedVisaDetailId, setSelectedVisaDetailId] = useState<string>();

  // Details dialog state
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [selectedDetailForDetails, setSelectedDetailForDetails] = useState<
    VisaDetailType | undefined
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
  const [visaDetailToDelete, setVisaDetailToDelete] = useState<string | null>(
    null
  );

  // Filter data based on search term
  const filteredData = useSearchFilter<VisaDetailType>(
    visaDetails,
    searchTerm,
    [
      "visa_number",
      "visa_type",
      "visa_country",
      "visa_detail_id",
      "contractor_id",
    ]
  );

  // Simple handlers for UI actions
  const handleAddClick = () => {
    setSelectedVisaDetailId(undefined);
    setIsFormDialogOpen(true);
  };

  const handleEditClick = (visaDetailId: string) => {
    setSelectedVisaDetailId(visaDetailId);
    setIsFormDialogOpen(true);
  };

  const handleDetailsClick = (visaDetail: VisaDetailType) => {
    setSelectedDetailForDetails(visaDetail);
    setIsDetailsDialogOpen(true);
  };

  const handleDeleteClick = (visaDetailId: string) => {
    setVisaDetailToDelete(visaDetailId);
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
        setCsvValidationErrors(result.data.errors || []);
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
      await createVisaDetail.mutateAsync(csvData);
      toast.success(`Successfully imported ${csvData.length} visa details`);
      refetch();
      setIsCSVDialogOpen(false);
      setCsvData([]);
      setCsvValidationErrors([]);
      setUploadFile(null);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      toast.error(`Failed to import visa details: ${errorMessage}`);
    }
  };

  const handleFormSuccess = () => {
    refetch();
    setIsFormDialogOpen(false);
  };

  const getContractorName = (contractorId: string) => {
    const contractor = contractors.find(
      (c) => c.contractor_id === contractorId
    );
    return contractor
      ? `${contractor.first_name} ${contractor.last_name}`
      : "Unknown";
  };

  const getVisaDetailSections = (): DetailSection[] => {
    if (!selectedDetailForDetails) return [];

    return [
      {
        title: "Visa Information",
        items: [
          { label: "ID", value: selectedDetailForDetails.visa_detail_id },
          { label: "Visa Number", value: selectedDetailForDetails.visa_number },
          { label: "Visa Type", value: selectedDetailForDetails.visa_type },
          {
            label: "Visa Country",
            value: selectedDetailForDetails.visa_country,
          },
          {
            label: "Visa Expiry Date",
            value: new Date(
              selectedDetailForDetails.visa_expiry_date
            ).toLocaleString(),
          },
          { label: "Visa Status", value: selectedDetailForDetails.visa_status },
          {
            label: "Visa Sponsor",
            value: selectedDetailForDetails.visa_sponsor,
          },
        ],
      },
      {
        title: "Country ID Information",
        items: [
          {
            label: "Country ID Number",
            value: selectedDetailForDetails.country_id_number,
          },
          {
            label: "Country ID Type",
            value: selectedDetailForDetails.country_id_type,
          },
          {
            label: "Country ID Expiry Date",
            value: new Date(
              selectedDetailForDetails.country_id_expiry_date
            ).toLocaleString(),
          },
          {
            label: "Country ID Status",
            value: selectedDetailForDetails.country_id_status,
          },
        ],
      },
    ];
  };

  const columns: ColumnDef<VisaDetailType>[] = [
    {
      accessorKey: "visa_detail_id",
      header: () => <div className="text-center">ID</div>,
      cell: ({ row }) => (
        <div className="font-medium text-center truncate max-w-[120px] md:max-w-none">
          {row.getValue("visa_detail_id")}
        </div>
      ),
    },
    {
      accessorKey: "contractor_id",
      header: () => <div className="text-center">Contractor</div>,
      cell: ({ row }) => (
        <div className="font-medium text-center truncate max-w-[120px] md:max-w-none">
          {getContractorName(row.getValue("contractor_id"))}
        </div>
      ),
    },
    {
      accessorKey: "visa_number",
      header: () => <div className="text-center">Visa Number</div>,
      cell: ({ row }) => (
        <div className="font-medium text-center truncate max-w-[120px] md:max-w-none">
          {row.getValue("visa_number")}
        </div>
      ),
    },
    {
      accessorKey: "visa_status",
      header: () => <div className="text-center">Status</div>,
      cell: ({ row }) => {
        const status = row.getValue("visa_status");
        return (
          <div className="flex justify-center">
            <Badge
              variant={
                status === "active"
                  ? "default"
                  : status === "expired"
                    ? "secondary"
                    : "destructive"
              }
            >
              {String(status)}
            </Badge>
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
              onClick={() => handleEditClick(row.original.visa_detail_id)}
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleDeleteClick(row.original.visa_detail_id)}
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
      <h1 className="text-xl sm:text-2xl font-semibold">
        Visa & ID Details Master Data
      </h1>
      <div className="flex flex-wrap justify-between items-center gap-2">
        <div className="relative flex flex-1 items-center gap-2">
          <Button
            size="sm"
            className="w-full sm:w-auto"
            onClick={handleAddClick}
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Visa Detail
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
            placeholder="Search visa details..."
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
      <VisaDetailForm
        visaDetailId={selectedVisaDetailId}
        open={isFormDialogOpen}
        onClose={() => setIsFormDialogOpen(false)}
        onSuccess={handleFormSuccess}
      />

      {/* Details Dialog */}
      {selectedDetailForDetails && (
        <DetailsDialog
          title={`Visa Detail - ${selectedDetailForDetails.visa_number}`}
          open={isDetailsDialogOpen}
          onClose={() => setIsDetailsDialogOpen(false)}
          sections={getVisaDetailSections()}
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
          title="Import Visa Details"
          description="Review visa details data before import"
        />
      )}

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmationDialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onDelete={deleteVisaDetail.mutateAsync}
        itemId={visaDetailToDelete}
        title="Delete Visa Detail"
        description="Are you sure you want to delete this visa detail? This action cannot be undone and may affect contractor information."
        successMessage="Visa detail deleted successfully"
        errorMessage="Failed to delete visa detail"
      />
    </div>
  );
}
