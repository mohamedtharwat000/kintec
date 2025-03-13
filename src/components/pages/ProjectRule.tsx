"use client";

import { useState } from "react";
import {
  useProjectRules,
  useDeleteProjectRule,
  useCreateProjectRule,
} from "@/hooks/useProjectRules";
import { useProjects } from "@/hooks/useProjects";
import { DataTable } from "@/components/dataTable/DataTable";
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Plus, Search, Pencil, Trash2, Upload, Info } from "lucide-react";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { ProjectRule as ProjectRuleType } from "@/types/Project";
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
import { ProjectRuleForm } from "@/components/forms/ProjectRule";
import { ProjectRuleDetails } from "@/components/detailsDialogs/ProjectRule";
import { Badge } from "@/components/ui/badge";
import { CSVPreviewDialog } from "@/components/csvPreviewDialog/ProjectRule";
import { parseProjectRule } from "@/lib/csv/projectRule";
import { tryCatch } from "@/lib/utils";

export function ProjectRule() {
  const { data: projectRules = [], isLoading } = useProjectRules();
  const { data: projects = [] } = useProjects();
  const deleteProjectRule = useDeleteProjectRule();
  const createProjectRule = useCreateProjectRule();

  const [searchTerm, setSearchTerm] = useState("");
  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
  const [selectedProjectRuleId, setSelectedProjectRuleId] = useState<
    string | null
  >(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [projectRuleToDelete, setProjectRuleToDelete] = useState<string | null>(
    null
  );
  const [isDeleting, setIsDeleting] = useState(false);
  const [viewDetailsOpen, setViewDetailsOpen] = useState(false);
  const [selectedProjectRule, setSelectedProjectRule] =
    useState<ProjectRuleType | null>(null);

  // CSV upload state
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [csvData, setCsvData] = useState<Partial<ProjectRuleType>[]>([]);
  const [csvFileName, setCsvFileName] = useState("");
  const [validationErrors, setValidationErrors] = useState<
    { row: number; error: string }[]
  >([]);

  const handleAddClick = () => {
    setSelectedProjectRuleId(null);
    setIsFormDialogOpen(true);
  };

  const handleEditClick = (projectRuleId: string) => {
    setSelectedProjectRuleId(projectRuleId);
    setIsFormDialogOpen(true);
  };

  const handleViewDetails = (projectRule: ProjectRuleType) => {
    setSelectedProjectRule(projectRule);
    setViewDetailsOpen(true);
  };

  const handleDeleteClick = (projectRuleId: string) => {
    setProjectRuleToDelete(projectRuleId);
    setDeleteDialogOpen(true);
  };

  const handleFormClose = () => {
    setIsFormDialogOpen(false);
  };

  const handleConfirmDelete = async () => {
    if (!projectRuleToDelete) return;

    setIsDeleting(true);
    const { error } = await tryCatch(() =>
      deleteProjectRule.mutateAsync(projectRuleToDelete)
    );

    if (error) {
      toast.error("Failed to delete project rule: " + error.message);
    } else {
      toast.success("Project rule deleted successfully");
    }

    setIsDeleting(false);
    setDeleteDialogOpen(false);
    setProjectRuleToDelete(null);
  };

  // Get project name by ID
  const getProjectName = (projectId: string) => {
    const project = projects.find((p) => p.project_id === projectId);
    return project ? project.project_name : "Unknown Project";
  };

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const { data, error } = await tryCatch(() => parseProjectRule(file));

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

    // Reset the file input
    event.target.value = "";
  };

  const handleConfirmCsvUpload = async () => {
    if (validationErrors.length > 0) {
      toast.error("Please fix validation errors before uploading");
      return Promise.reject("Validation errors exist");
    }

    try {
      // Add unique IDs to each project rule
      const projectRulesWithIds = csvData.map((rule) => ({
        ...rule,
        project_rule_id: crypto.randomUUID(),
      }));

      // Submit all CSV data
      await createProjectRule.mutateAsync(projectRulesWithIds);

      toast.success(
        `Successfully imported ${projectRulesWithIds.length} project rules`
      );
      setIsPreviewOpen(false);
      setCsvData([]);
      setCsvFileName("");
      return Promise.resolve();
    } catch (error) {
      console.error("Error importing CSV data:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to import project rules from CSV";
      toast.error(errorMessage);
      return Promise.reject(error);
    }
  };

  const columns: ColumnDef<ProjectRuleType>[] = [
    {
      accessorKey: "project_rule_id",
      header: () => <div className="text-center">Rule ID</div>,
      cell: ({ row }) => (
        <div className="font-mono text-xs w-32 truncate">
          {row.getValue("project_rule_id")}
        </div>
      ),
    },
    {
      accessorKey: "project_id",
      header: () => <div className="text-center">Project</div>,
      cell: ({ row }) => (
        <div className="w-40 truncate">
          {getProjectName(row.getValue("project_id"))}
        </div>
      ),
    },
    {
      accessorKey: "project_rules_reviewer_name",
      header: () => <div className="text-center">Reviewer</div>,
      cell: ({ row }) => (
        <div className="w-32 truncate">
          {row.getValue("project_rules_reviewer_name") || "Not assigned"}
        </div>
      ),
    },
    {
      accessorKey: "additional_review_process",
      header: () => <div className="text-center">Additional Review</div>,
      cell: ({ row }) => {
        const value = row.getValue("additional_review_process") as
          | string
          | null;
        return (
          <Badge variant={value === "required" ? "default" : "outline"}>
            {value ? value : "Not specified"}
          </Badge>
        );
      },
    },
    {
      accessorKey: "major_project_indicator",
      header: () => <div className="text-center">Major Project</div>,
      cell: ({ row }) => {
        const value = row.getValue("major_project_indicator");
        return (
          <Badge variant={value === true ? "default" : "outline"}>
            {value === true ? "Yes" : "No"}
          </Badge>
        );
      },
    },
    {
      id: "actions",
      header: () => <div className="text-center">Actions</div>,
      cell: ({ row }) => (
        <div className="flex justify-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleEditClick(row.original.project_rule_id)}
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleDeleteClick(row.original.project_rule_id)}
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
      ),
    },
  ];

  const filteredData = projectRules.filter((rule) => {
    const projectName = getProjectName(rule.project_id);
    return (
      projectName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (rule.project_rules_reviewer_name?.toLowerCase() || "").includes(
        searchTerm.toLowerCase()
      ) ||
      (rule.special_project_rules?.toLowerCase() || "").includes(
        searchTerm.toLowerCase()
      ) ||
      rule.project_rule_id.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  // Create map of project IDs to names for the CSV preview
  const projectNameMap = projects.reduce((acc, project) => {
    acc[project.project_id] = project.project_name;
    return acc;
  }, {} as Record<string, string>);

  return (
    <div className="flex flex-col gap-4 p-4">
      <h1 className="text-xl sm:text-2xl font-semibold">Project Rules</h1>
      <div className="flex flex-wrap justify-between items-center gap-2">
        <div className="relative flex flex-1 items-center gap-2">
          <Button
            size="sm"
            className="w-full sm:w-auto"
            onClick={handleAddClick}
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Project Rule
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
            placeholder="Search project rules..."
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
              project rule and remove all related data.
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

      {/* Add/Edit Form Dialog */}
      {isFormDialogOpen && (
        <ProjectRuleForm
          projectRuleId={selectedProjectRuleId || undefined}
          open={isFormDialogOpen}
          onClose={handleFormClose}
        />
      )}

      {/* Details Dialog */}
      {viewDetailsOpen && selectedProjectRule && (
        <ProjectRuleDetails
          projectRule={selectedProjectRule}
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
        projectNameMap={projectNameMap}
        title="Preview Project Rules CSV Data"
      />
    </div>
  );
}
