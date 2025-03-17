"use client";

import { useState } from "react";
import {
  useProjectRules,
  useDeleteProjectRule,
  useCreateProjectRule,
  useParseProjectRuleCsv,
} from "@/hooks/useProjectRules";
import { useProjects } from "@/hooks/useProjects";
import { DataTable } from "@/components/dataTable/DataTable";
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Plus, Search, Pencil, Trash2, Upload, Info } from "lucide-react";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { ProjectRule as ProjectRuleType } from "@/types/ProjectRule";
import { ProjectRuleForm } from "@/components/forms/ProjectRule";
import { Badge } from "@/components/ui/badge";
import { CSVPreviewDialog } from "@/components/reusableModels/CSVPreviewDialog";
import { DeleteConfirmationDialog } from "@/components/reusableModels/DeleteConfirmationDialog";
import {
  DetailsDialog,
  DetailSection,
} from "@/components/reusableModels/DetailsDialog";

export function ProjectRule() {
  // Core data fetching hooks
  const { data: projectRules = [], isLoading, refetch } = useProjectRules();
  const { data: projects = [] } = useProjects();
  const deleteProjectRule = useDeleteProjectRule();
  const createProjectRule = useCreateProjectRule();
  const parseCSV = useParseProjectRuleCsv();

  // Page-level state management
  const [searchTerm, setSearchTerm] = useState("");

  // Form dialog state
  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
  const [selectedProjectRuleId, setSelectedProjectRuleId] = useState<string>();

  // Details dialog state
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [selectedProjectRule, setSelectedProjectRule] = useState<
    ProjectRuleType | undefined
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
  const [projectRuleToDelete, setProjectRuleToDelete] = useState<string | null>(
    null
  );

  // Filter data based on search term
  const filteredData = projectRules.filter((rule) => {
    const projectName = projects.find((p) => p.project_id === rule.project_id);
    return (
      projectName?.project_name
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      (rule.project_rules_reviewer_name?.toLowerCase() || "").includes(
        searchTerm.toLowerCase()
      ) ||
      (rule.special_project_rules?.toLowerCase() || "").includes(
        searchTerm.toLowerCase()
      ) ||
      rule.project_rule_id.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  // Simple handlers for UI actions
  const handleAddClick = () => {
    setSelectedProjectRuleId(undefined);
    setIsFormDialogOpen(true);
  };

  const handleEditClick = (projectRuleId: string) => {
    setSelectedProjectRuleId(projectRuleId);
    setIsFormDialogOpen(true);
  };

  const handleDetailsClick = (projectRule: ProjectRuleType) => {
    setSelectedProjectRule(projectRule);
    setIsDetailsDialogOpen(true);
  };

  const handleDeleteClick = (projectRuleId: string) => {
    setProjectRuleToDelete(projectRuleId);
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
      await createProjectRule.mutateAsync(csvData);
      toast.success(`Successfully imported ${csvData.length} project rules`);
      refetch();
      setIsCSVDialogOpen(false);
      setCsvData([]);
      setCsvValidationErrors([]);
      setUploadFile(null);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      toast.error(`Failed to import project rules: ${errorMessage}`);
    }
  };

  const handleFormSuccess = () => {
    refetch();
    setIsFormDialogOpen(false);
  };

  const getProjectRuleDetailSections = (): DetailSection[] => {
    if (!selectedProjectRule) return [];

    return [
      {
        title: "Project Rule Information",
        items: [
          { label: "Rule ID", value: selectedProjectRule.project_rule_id },
          {
            label: "Project",
            value:
              projects.find(
                (p) => p.project_id === selectedProjectRule.project_id
              )?.project_name || "Unknown",
          },
          {
            label: "Reviewer",
            value:
              selectedProjectRule.project_rules_reviewer_name || "Not assigned",
          },
          {
            label: "Additional Review",
            value:
              selectedProjectRule.additional_review_process || "Not specified",
          },
          {
            label: "Major Project",
            value:
              selectedProjectRule.major_project_indicator === true
                ? "Yes"
                : "No",
          },
          {
            label: "Special Project Rules",
            value: selectedProjectRule.special_project_rules || "None",
          },
        ],
      },
    ];
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
          {projects.find((p) => p.project_id === row.getValue("project_id"))
            ?.project_name || "Unknown"}
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
      cell: ({ row }) => {
        return (
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
            onChange={handleFileChange}
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

      {/* Add/Edit Form Dialog */}
      <ProjectRuleForm
        projectRuleId={selectedProjectRuleId}
        open={isFormDialogOpen}
        onClose={() => setIsFormDialogOpen(false)}
        onSuccess={handleFormSuccess}
      />

      {/* Details Dialog */}
      {selectedProjectRule && (
        <DetailsDialog
          title={`Project Rule - ${selectedProjectRule.project_rule_id}`}
          open={isDetailsDialogOpen}
          onClose={() => setIsDetailsDialogOpen(false)}
          sections={getProjectRuleDetailSections()}
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
          title="Import Project Rules"
          description="Review project rules before import"
        />
      )}

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmationDialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onDelete={deleteProjectRule.mutateAsync}
        itemId={projectRuleToDelete}
        title="Delete Project Rule"
        description="Are you sure you want to delete this project rule? This action cannot be undone."
        successMessage="Project rule deleted successfully"
        errorMessage="Failed to delete project rule"
      />
    </div>
  );
}
