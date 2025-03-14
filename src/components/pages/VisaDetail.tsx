"use client";

import { useState } from "react";
import {
  useVisaDetails,
  useDeleteVisaDetail,
  useCreateVisaDetail,
} from "@/hooks/useVisaDetail";
import { useContractors } from "@/hooks/useContractor";
import { DataTable } from "@/components/dataTable/DataTable";
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Plus, Search, Pencil, Trash2, Upload, Info } from "lucide-react";
import { Input } from "@/components/ui/input";
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
import { VisaDetailForm } from "@/components/forms/VisaDetailForm";
import { VisaDetailDetails } from "@/components/detailsDialogs/VisaDetailDetails";
import { CSVPreviewDialog } from "@/components/csvPreviewDialog/VisaDetails";
import { Badge } from "@/components/ui/badge";
import { parseVisaDetail } from "@/lib/csv/visaDetail";
import { tryCatch } from "@/lib/utils";
import type { VisaDetail as VisaDetailType } from "@/types/VisaDetail";

export function VisaDetail() {
  const { data: visaDetails = [], isLoading } = useVisaDetails();
  const { data: contractors = [] } = useContractors();
  const deleteVisaDetail = useDeleteVisaDetail();
  const createVisaDetail = useCreateVisaDetail();

  const [searchTerm, setSearchTerm] = useState("");
  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
  const [selectedVisaDetailId, setSelectedVisaDetailId] = useState<
    string | null
  >(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [visaDetailToDelete, setVisaDetailToDelete] = useState<string | null>(
    null
  );
  const [isDeleting, setIsDeleting] = useState(false);
  const [viewDetailsOpen, setViewDetailsOpen] = useState(false);
  const [selectedDetail, setSelectedDetail] = useState<
    VisaDetailType | undefined
  >(undefined);

  // CSV upload state
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [csvData, setCsvData] = useState<Partial<VisaDetailType>[]>([]);
  const [csvFileName, setCsvFileName] = useState("");
  const [validationErrors, setValidationErrors] = useState<
    { row: number; error: string }[]
  >([]);

  const handleAddClick = () => {
    setSelectedVisaDetailId(null);
    setIsFormDialogOpen(true);
  };

  const handleEditClick = (visaDetailId: string) => {
    setSelectedVisaDetailId(visaDetailId);
    setIsFormDialogOpen(true);
  };

  const handleViewDetails = (visaDetail: VisaDetailType) => {
    setSelectedDetail(visaDetail);
    setViewDetailsOpen(true);
  };

  const handleDeleteClick = (visaDetailId: string) => {
    setVisaDetailToDelete(visaDetailId);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!visaDetailToDelete) return;

    setIsDeleting(true);
    const { error } = await tryCatch(() =>
      deleteVisaDetail.mutateAsync(visaDetailToDelete)
    );

    if (error) {
      toast.error("Failed to delete visa detail: " + error.message);
    } else {
      toast.success("Visa detail deleted successfully");
    }

    setIsDeleting(false);
    setDeleteDialogOpen(false);
    setVisaDetailToDelete(null);
  };

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const { data, error } = await tryCatch(() => parseVisaDetail(file));

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
      createVisaDetail.mutateAsync(csvData)
    );

    if (error) {
      toast.error("Failed to import visa details: " + error.message);
    } else {
      toast.success(`Successfully imported ${csvData.length} visa details`);
      setIsPreviewOpen(false);
      setCsvData([]);
      setCsvFileName("");
    }
  };

  const getContractorName = (contractorId: string) => {
    const contractor = contractors.find(
      (c) => c.contractor_id === contractorId
    );
    return contractor
      ? `${contractor.first_name} ${contractor.last_name}`
      : "Unknown";
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
              onClick={() => handleViewDetails(row.original)}
            >
              <Info className="h-4 w-4" />
            </Button>
          </div>
        );
      },
    },
  ];

  const filteredData = visaDetails.filter(
    (detail) =>
      detail.visa_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      detail.visa_type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      detail.visa_country?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      detail.visa_detail_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      getContractorName(detail.contractor_id)
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
  );

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
            onChange={handleFileUpload}
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
        visaDetailId={selectedVisaDetailId || undefined}
        open={isFormDialogOpen}
        onClose={() => setIsFormDialogOpen(false)}
      />

      {/* Details Dialog */}
      {selectedDetail && (
        <VisaDetailDetails
          visaDetail={selectedDetail}
          open={viewDetailsOpen}
          onClose={() => setViewDetailsOpen(false)}
        />
      )}

      {/* CSV Preview Dialog */}
      <CSVPreviewDialog
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        data={csvData}
        fileName={csvFileName}
        onConfirm={handleConfirmCsvUpload}
        validationErrors={validationErrors}
        title="Preview Visa Details CSV Data"
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
              visa detail and may affect contractor information.
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
