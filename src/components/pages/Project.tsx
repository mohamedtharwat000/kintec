"use client";

import { useState } from "react";
import {
  useProjects,
  useDeleteProject,
  useCreateProject,
  useParseProjectCsv,
  useSearchFilter,
} from "@/hooks/useProjects";
import { DataTable } from "@/components/dataTable/DataTable";
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Plus, Search, Pencil, Trash2, Upload, Info } from "lucide-react";
import { Input } from "@/components/ui/input";
import { ProjectForm } from "@/components/forms/Project";
import { Project as ProjectType } from "@/types/Project";
import { CSVPreviewDialog } from "@/components/reusableModels/CSVPreviewDialog";
import { DeleteConfirmationDialog } from "@/components/reusableModels/DeleteConfirmationDialog";
import { toast } from "sonner";
import {
  DetailsDialog,
  DetailSection,
} from "@/components/reusableModels/DetailsDialog";

export function Project() {
  // Core data fetching hook
  const { data: projects = [], isLoading, refetch } = useProjects();
  const deleteProject = useDeleteProject();
  const createProject = useCreateProject();
  const parseCSV = useParseProjectCsv();

  // Page-level state management
  const [searchTerm, setSearchTerm] = useState("");

  // Form dialog state
  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState<string>();

  // Details dialog state
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [selectedProjectForDetails, setSelectedProjectForDetails] = useState<
    ProjectType | undefined
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
  const [projectToDelete, setProjectToDelete] = useState<string | null>(null);

  // Filter data based on search term
  const filteredData = useSearchFilter<ProjectType>(projects, searchTerm, [
    "project_name",
    "project_type",
    "project_id",
  ]);

  // Simple handlers for UI actions
  const handleAddClick = () => {
    setSelectedProjectId(undefined);
    setIsFormDialogOpen(true);
  };

  const handleEditClick = (projectId: string) => {
    setSelectedProjectId(projectId);
    setIsFormDialogOpen(true);
  };

  const handleDetailsClick = (project: ProjectType) => {
    setSelectedProjectForDetails(project);
    setIsDetailsDialogOpen(true);
  };

  const handleDeleteClick = (projectId: string) => {
    setProjectToDelete(projectId);
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
      await createProject.mutateAsync(csvData);
      toast.success(`Successfully imported ${csvData.length} projects`);
      refetch();
      setIsCSVDialogOpen(false);
      setCsvData([]);
      setCsvValidationErrors([]);
      setUploadFile(null);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      toast.error(`Failed to import projects: ${errorMessage}`);
    }
  };

  const handleFormSuccess = () => {
    refetch();
    setIsFormDialogOpen(false);
  };

  const getProjectDetailSections = (): DetailSection[] => {
    if (!selectedProjectForDetails) return [];

    return [
      {
        title: "Project Information",
        items: [
          { label: "Project ID", value: selectedProjectForDetails.project_id },
          {
            label: "Project Name",
            value: selectedProjectForDetails.project_name,
          },
          {
            label: "Project Type",
            value: selectedProjectForDetails.project_type,
          },
        ],
      },
    ];
  };

  const columns: ColumnDef<ProjectType>[] = [
    {
      accessorKey: "project_id",
      header: () => <div className="text-center">Project ID</div>,
      cell: ({ row }) => (
        <div className="font-medium text-center truncate max-w-[120px] md:max-w-none">
          {row.getValue("project_id")}
        </div>
      ),
    },
    {
      accessorKey: "project_name",
      header: () => <div className="text-center">Name</div>,
      cell: ({ row }) => (
        <div className="font-medium text-center truncate max-w-[120px] md:max-w-none">
          {row.getValue("project_name")}
        </div>
      ),
    },
    {
      accessorKey: "project_type",
      header: () => <div className="text-center">Type</div>,
      cell: ({ row }) => (
        <div className="text-center truncate max-w-[120px] md:max-w-none">
          {row.getValue("project_type")}
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
              onClick={() => handleEditClick(row.original.project_id)}
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleDeleteClick(row.original.project_id)}
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
      <h1 className="text-xl sm:text-2xl font-semibold">Project Master Data</h1>
      <div className="flex flex-wrap justify-between items-center gap-2">
        <div className="relative flex flex-1 items-center gap-2">
          <Button
            size="sm"
            className="w-full sm:w-auto"
            onClick={handleAddClick}
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Project
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
            placeholder="Search projects..."
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
      <ProjectForm
        projectId={selectedProjectId}
        open={isFormDialogOpen}
        onClose={() => setIsFormDialogOpen(false)}
        onSuccess={handleFormSuccess}
      />

      {/* Details Dialog */}
      {selectedProjectForDetails && (
        <DetailsDialog
          title={`Project - ${selectedProjectForDetails.project_name}`}
          open={isDetailsDialogOpen}
          onClose={() => setIsDetailsDialogOpen(false)}
          sections={getProjectDetailSections()}
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
          title="Import Projects"
          description="Review project data before import"
        />
      )}

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmationDialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onDelete={deleteProject.mutateAsync}
        itemId={projectToDelete}
        title="Delete Project"
        description="Are you sure you want to delete this project? This action cannot be undone."
        successMessage="Project deleted successfully"
        errorMessage="Failed to delete project"
      />
    </div>
  );
}
