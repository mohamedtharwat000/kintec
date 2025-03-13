"use client";

import { useState } from "react";
import {
  useProjects,
  useDeleteProject,
  useCreateProject,
} from "@/hooks/useProjects";
import { DataTable } from "@/components/dataTable/DataTable";
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Plus, Search, Pencil, Trash2, Upload, Info } from "lucide-react";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Project as ProjectType } from "@/types/Project";
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
import { ProjectForm } from "@/components/forms/Project";
import { ProjectDetails } from "@/components/detailsDialogs/Project";
import { CSVPreviewDialog } from "@/components/csvPreviewDialog/Project";
import { parseProject } from "@/lib/csv/project";
import { tryCatch } from "@/lib/utils";

export function Project() {
  const { data: projects = [], isLoading } = useProjects();
  const deleteProject = useDeleteProject();
  const createProject = useCreateProject();

  const [searchTerm, setSearchTerm] = useState("");
  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(
    null
  );
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<ProjectType | null>(
    null
  );

  // CSV upload state
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [csvData, setCsvData] = useState<Partial<ProjectType>[]>([]);
  const [csvFileName, setCsvFileName] = useState("");
  const [validationErrors, setValidationErrors] = useState<
    { row: number; error: string }[]
  >([]);

  const handleAddClick = () => {
    setSelectedProjectId(null);
    setIsFormDialogOpen(true);
  };

  const handleEditClick = (projectId: string) => {
    setSelectedProjectId(projectId);
    setIsFormDialogOpen(true);
  };

  const handleViewDetails = (project: ProjectType) => {
    setSelectedProject(project);
    setIsDetailsDialogOpen(true);
  };

  const handleDeleteClick = (projectId: string) => {
    setProjectToDelete(projectId);
    setDeleteDialogOpen(true);
  };

  const handleFormClose = () => {
    setIsFormDialogOpen(false);
  };

  const handleConfirmDelete = async () => {
    if (!projectToDelete) return;

    setIsDeleting(true);
    const { error } = await tryCatch(() =>
      deleteProject.mutateAsync(projectToDelete)
    );

    if (error) {
      toast.error("Failed to delete project: " + error.message);
    } else {
      toast.success("Project deleted successfully");
    }

    setIsDeleting(false);
    setDeleteDialogOpen(false);
    setProjectToDelete(null);
  };

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      // Parse CSV file using the dedicated parser
      const result = await parseProject(file);

      setCsvFileName(file.name);
      setCsvData(result.data);
      setValidationErrors(result.errors || []);

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

  const handleConfirmCsvUpload = async () => {
    if (validationErrors.length > 0) {
      toast.error("Please fix validation errors before uploading");
      return Promise.reject("Validation errors present");
    }

    const { error } = await tryCatch(() => createProject.mutateAsync(csvData));

    if (error) {
      toast.error("Failed to import projects from CSV: " + error.message);
      return Promise.reject(error);
    } else {
      toast.success(`Successfully imported ${csvData.length} projects`);
      setIsPreviewOpen(false);
      setCsvData([]);
      return Promise.resolve();
    }
  };

  const filteredData = projects.filter(
    (project) =>
      project.project_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.project_type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.project_id?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const columns: ColumnDef<ProjectType>[] = [
    {
      accessorKey: "project_id",
      header: () => <div className="text-center">Project ID</div>,
      cell: ({ row }) => (
        <div className="font-mono text-xs truncate !max-w-[100px] md:max-w-none">
          {row.getValue("project_id")}
        </div>
      ),
    },
    {
      accessorKey: "project_name",
      header: () => <div className="text-center">Project Name</div>,
      cell: ({ row }) => (
        <div className="font-medium truncate max-w-[120px] md:max-w-none">
          {row.getValue("project_name")}
        </div>
      ),
    },
    {
      accessorKey: "project_type",
      header: () => <div className="text-center">Project Type</div>,
      cell: ({ row }) => (
        <div className="truncate max-w-[150px] md:max-w-none">
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
              onClick={() => handleViewDetails(row.original)}
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
      <h1 className="text-xl sm:text-2xl font-semibold">Projects</h1>
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
            onChange={handleFileUpload}
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
        projectId={selectedProjectId || undefined}
        open={isFormDialogOpen}
        onClose={handleFormClose}
      />

      {/* Details Dialog */}
      {isDetailsDialogOpen && selectedProject && (
        <ProjectDetails
          project={selectedProject}
          open={isDetailsDialogOpen}
          onClose={() => setIsDetailsDialogOpen(false)}
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
              project and may affect related contracts and rules.
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
