"use client";

import { useState } from "react";
import { useProjects, useDeleteProject } from "@/hooks/useApp";
import { DataTable } from "@/components/dataTable/Table";
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Plus, Search, Pencil, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { DetailDialog } from "@/components/ui/DetailDialog";
import { ProjectForm } from "@/components/forms/ProjectForm";
import { toast } from "sonner";
import type { Project as ProjectType } from "@/types/Project";
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

export function Project() {
  const { data: projects = [], isLoading } = useProjects();
  const deleteProject = useDeleteProject();

  const [searchTerm, setSearchTerm] = useState("");
  const [formMode, setFormMode] = useState<"none" | "add" | "edit">("none");
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<string | null>(null);

  const handleAddClick = () => {
    setSelectedProjectId(null);
    setFormMode("add");
  };

  const handleEditClick = (projectId: string) => {
    setSelectedProjectId(projectId);
    setFormMode("edit");
  };

  const handleDeleteClick = (projectId: string) => {
    setProjectToDelete(projectId);
    setDeleteDialogOpen(true);
  };

  const handleCancelForm = () => {
    setFormMode("none");
  };

  const handleFormSuccess = () => {
    setFormMode("none");
  };

  const handleConfirmDelete = async () => {
    if (!projectToDelete) return;

    try {
      await deleteProject.mutateAsync(projectToDelete);
      toast.success("Project deleted successfully");
    } catch (error) {
      toast.error("Failed to delete project");
    } finally {
      setDeleteDialogOpen(false);
      setProjectToDelete(null);
    }
  };

  const columns: ColumnDef<ProjectType>[] = [
    {
      accessorKey: "project_id",
      header: "ID",
    },
    {
      accessorKey: "project_name",
      header: "Name",
    },
    {
      accessorKey: "project_type",
      header: "Type",
    },
    {
      id: "contracts_count",
      header: "Active Contracts",
      cell: ({ row }) => {
        const contracts = row.original.contracts || [];
        const activeContracts = contracts.filter(
          (contract) => contract.contract_status === "active"
        );
        return activeContracts.length;
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
          <DetailDialog
            data={row.original}
            title="Project Details"
            excludeFields={["contracts", "project_rules"]}
          />
        </div>
      ),
    },
  ];

  const filteredData = projects.filter(
    (project) =>
      project.project_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.project_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.project_type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Show form if in add or edit mode
  if (formMode === "add" || formMode === "edit") {
    return (
      <ProjectForm
        projectId={
          formMode === "edit" ? selectedProjectId || undefined : undefined
        }
        onCancel={handleCancelForm}
        onSuccess={handleFormSuccess}
      />
    );
  }

  return (
    <div className="p-8">
      <div className="mb-8 flex justify-between items-center">
        <h1 className="text-2xl font-semibold">Project Master Data</h1>
        <Button onClick={handleAddClick}>
          <Plus className="mr-2 h-4 w-4" />
          Add Project
        </Button>
      </div>

      <div className="mb-6 flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
          <Input
            className="pl-10"
            placeholder="Search projects..."
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
              project and may affect associated contracts.
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
