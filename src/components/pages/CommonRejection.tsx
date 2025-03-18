"use client";

import { useState } from "react";
import {
  useCommonRejections,
  useDeleteCommonRejection,
  useSearchFilter,
  useParseCommonRejectionCsv,
  useCreateCommonRejection,
} from "@/hooks/useCommonRejection";
import { DataTable } from "@/components/dataTable/DataTable";
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Plus, Search, Pencil, Trash2, Upload, Info } from "lucide-react";
import { Input } from "@/components/ui/input";
import { CommonRejectionForm } from "@/components/forms/CommonRejection";
import { CommonRejection as CommonRejectionType } from "@/types/CommonRejection";
import { CSVPreviewDialog } from "@/components/reusableModels/CSVPreviewDialog";
import { DeleteConfirmationDialog } from "@/components/reusableModels/DeleteConfirmationDialog";
import {
  DetailsDialog,
  DetailSection,
} from "@/components/reusableModels/DetailsDialog";
import { toast } from "sonner";

export function CommonRejection() {
  // Core data fetching hook
  const { data: rejections = [], isLoading, refetch } = useCommonRejections();
  const deleteRejection = useDeleteCommonRejection();
  const createRejection = useCreateCommonRejection();
  const parseCSV = useParseCommonRejectionCsv();

  // Page-level state management
  const [searchTerm, setSearchTerm] = useState("");

  // Form dialog state
  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
  const [selectedRejectionId, setSelectedRejectionId] = useState<string>();

  // Details dialog state
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [selectedRejectionForDetails, setSelectedRejectionForDetails] =
    useState<CommonRejectionType | undefined>(undefined);

  // CSV dialog state
  const [isCSVDialogOpen, setIsCSVDialogOpen] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [csvData, setCsvData] = useState<any[]>([]);
  const [csvValidationErrors, setCsvValidationErrors] = useState<
    { row: number; error: string }[]
  >([]);

  // Delete dialog state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [rejectionToDelete, setRejectionToDelete] = useState<string | null>(
    null
  );

  // Filter data based on search term
  const filteredData = useSearchFilter<CommonRejectionType>(
    rejections,
    searchTerm,
    ["common_rejection_id", "common_rejection_type", "resolution_process"]
  );

  // UI action handlers
  const handleAddClick = () => {
    setSelectedRejectionId(undefined);
    setIsFormDialogOpen(true);
  };

  const handleEditClick = (rejectionId: string) => {
    setSelectedRejectionId(rejectionId);
    setIsFormDialogOpen(true);
  };

  const handleDetailsClick = (rejection: CommonRejectionType) => {
    setSelectedRejectionForDetails(rejection);
    setIsDetailsDialogOpen(true);
  };

  const handleDeleteClick = (rejectionId: string) => {
    setRejectionToDelete(rejectionId);
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
      await createRejection.mutateAsync(csvData);
      toast.success(
        `Successfully imported ${csvData.length} rejection reasons`
      );
      refetch();
      setIsCSVDialogOpen(false);
      setCsvData([]);
      setCsvValidationErrors([]);
      setUploadFile(null);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      toast.error(`Failed to import rejection reasons: ${errorMessage}`);
    }
  };

  const handleFormSuccess = () => {
    refetch();
    setIsFormDialogOpen(false);
  };

  // Generate detail sections for the rejection reason
  const getRejectionDetailSections = (): DetailSection[] => {
    if (!selectedRejectionForDetails) return [];

    return [
      {
        title: "Rejection Details",
        items: [
          {
            label: "ID",
            value: selectedRejectionForDetails.common_rejection_id,
          },
          {
            label: "Rejection Type",
            value: selectedRejectionForDetails.common_rejection_type,
          },
          {
            label: "Resolution Process",
            value: selectedRejectionForDetails.resolution_process,
          },
        ],
      },
    ];
  };

  const columns: ColumnDef<CommonRejectionType>[] = [
    {
      accessorKey: "common_rejection_id",
      header: () => <div className="text-center">ID</div>,
      cell: ({ row }) => (
        <div className="font-medium text-center truncate max-w-[120px] md:max-w-none">
          {row.getValue("common_rejection_id")}
        </div>
      ),
    },
    {
      accessorKey: "common_rejection_type",
      header: () => <div className="text-center">Type</div>,
      cell: ({ row }) => (
        <div className="font-medium text-center truncate max-w-[120px] md:max-w-none">
          {row.getValue("common_rejection_type")}
        </div>
      ),
    },
    {
      accessorKey: "resolution_process",
      header: () => <div className="text-center">Resolution Process</div>,
      cell: ({ row }) => (
        <div className="font-medium text-center truncate max-w-[200px] md:max-w-none">
          {row.getValue("resolution_process")}
        </div>
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
              onClick={() => handleEditClick(row.original.common_rejection_id)}
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() =>
                handleDeleteClick(row.original.common_rejection_id)
              }
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
      <h1 className="text-xl sm:text-2xl font-semibold">
        Common Rejection Reasons
      </h1>
      <div className="flex flex-wrap justify-between items-center gap-2">
        <div className="relative flex flex-1 items-center gap-2">
          <Button
            size="sm"
            className="w-full sm:w-auto"
            onClick={handleAddClick}
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Rejection Reason
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
            placeholder="Search rejection reasons..."
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
      <CommonRejectionForm
        rejectionId={selectedRejectionId}
        open={isFormDialogOpen}
        onClose={() => setIsFormDialogOpen(false)}
        onSuccess={handleFormSuccess}
      />

      {/* Details Dialog - Using the reusable component */}
      {selectedRejectionForDetails && (
        <DetailsDialog
          title={`Rejection Reason: ${selectedRejectionForDetails.common_rejection_type}`}
          open={isDetailsDialogOpen}
          onClose={() => setIsDetailsDialogOpen(false)}
          sections={getRejectionDetailSections()}
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
          title="Import Rejection Reasons"
          description="Review rejection reasons data before import"
        />
      )}

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmationDialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onDelete={deleteRejection.mutateAsync}
        itemId={rejectionToDelete}
        title="Delete Rejection Reason"
        description="Are you sure you want to delete this rejection reason? This action cannot be undone."
        successMessage="Rejection reason deleted successfully"
        errorMessage="Failed to delete rejection reason"
      />
    </div>
  );
}
