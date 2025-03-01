import React, { useEffect } from "react";
import { Save, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useProject, useCreateProject, useUpdateProject } from "@/hooks/useApp";
import { Project, AdditionalReviewProcess } from "@/types/Project";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const formSchema = z.object({
  project_id: z.string().min(1, "Project ID is required"),
  project_name: z.string().min(1, "Project name is required"),
  project_type: z.string().min(1, "Project type is required"),
  special_project_rules: z.string().optional(),
  project_rules_reviewer_name: z.string().optional(),
  additional_review_process: z.nativeEnum(AdditionalReviewProcess).optional(),
  major_project_indicator: z.boolean().optional(),
});

type FormData = z.infer<typeof formSchema>;

interface ProjectFormProps {
  projectId?: string;
  onCancel: () => void;
  onSuccess?: () => void;
}

export function ProjectForm({
  projectId,
  onCancel,
  onSuccess,
}: ProjectFormProps) {
  const isEditing = !!projectId;
  const { data: existingProject, isLoading: isLoadingProject } = useProject(
    projectId || ""
  );

  const createProject = useCreateProject();
  const updateProject = useUpdateProject();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      project_id: "",
      project_name: "",
      project_type: "",
      special_project_rules: "",
      project_rules_reviewer_name: "",
      additional_review_process: undefined,
      major_project_indicator: false,
    },
  });

  // Populate form when editing existing project
  useEffect(() => {
    if (isEditing && existingProject) {
      const projectRule = existingProject.project_rules?.[0];
      form.reset({
        project_id: existingProject.project_id,
        project_name: existingProject.project_name,
        project_type: existingProject.project_type,
        special_project_rules: projectRule?.special_project_rules || "",
        project_rules_reviewer_name:
          projectRule?.project_rules_reviewer_name || "",
        additional_review_process: projectRule?.additional_review_process,
        major_project_indicator: projectRule?.major_project_indicator || false,
      });
    }
  }, [existingProject, form, isEditing]);

  const onSubmit = async (data: FormData) => {
    try {
      // Extract the basic project data
      const projectData = {
        project_id: data.project_id,
        project_name: data.project_name,
        project_type: data.project_type,
      };

      // Create project rules data if any of the fields are provided
      const hasProjectRules =
        data.special_project_rules ||
        data.project_rules_reviewer_name ||
        data.additional_review_process !== undefined ||
        data.major_project_indicator !== undefined;

      const projectRules = hasProjectRules
        ? [
            {
              project_rule_id:
                existingProject?.project_rules?.[0]?.project_rule_id ||
                `RULE-${data.project_id}`,
              project_id: data.project_id,
              special_project_rules: data.special_project_rules || undefined,
              project_rules_reviewer_name:
                data.project_rules_reviewer_name || undefined,
              additional_review_process: data.additional_review_process,
              major_project_indicator: data.major_project_indicator,
            },
          ]
        : undefined;

      const submitData = {
        ...projectData,
        project_rules: projectRules,
      };

      if (isEditing) {
        await updateProject.mutateAsync({
          id: projectId!,
          data: submitData,
        });
        toast.success("Project updated successfully");
      } else {
        await createProject.mutateAsync(submitData as Omit<Project, "id">);
        toast.success("Project created successfully");
      }

      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error(error);
      toast.error(
        isEditing ? "Failed to update project" : "Failed to create project"
      );
    }
  };

  const isSubmitting = createProject.isPending || updateProject.isPending;

  if (isEditing && isLoadingProject) {
    return (
      <div className="flex justify-center items-center min-h-[300px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="py-6">
      <div className="max-w-4xl mx-auto px-4">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-semibold">
              {isEditing ? "Edit Project" : "Add New Project"}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {isEditing
                ? "Update the project details below"
                : "Complete the required details to add a new project."}
            </p>
          </div>
          <div className="flex space-x-3">
            <Button variant="ghost" onClick={onCancel} disabled={isSubmitting}>
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button
              onClick={form.handleSubmit(onSubmit)}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              {isEditing ? "Update" : "Save"}
            </Button>
          </div>
        </div>

        <Card className="mt-6">
          <CardContent className="pt-6">
            <Form {...form}>
              <form className="grid grid-cols-1 gap-y-6 sm:grid-cols-2 gap-x-4">
                <FormField
                  control={form.control}
                  name="project_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Project ID</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g., PROJ001"
                          {...field}
                          disabled={isEditing || isSubmitting}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="project_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Project Name</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter project name"
                          {...field}
                          disabled={isSubmitting}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="project_type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Project Type</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g., Development, Maintenance, Implementation"
                          {...field}
                          disabled={isSubmitting}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="sm:col-span-2 border-t pt-4 mt-2">
                  <h3 className="font-medium text-base mb-2">
                    Project Rules (Optional)
                  </h3>
                </div>

                <FormField
                  control={form.control}
                  name="special_project_rules"
                  render={({ field }) => (
                    <FormItem className="sm:col-span-2">
                      <FormLabel>Special Project Rules</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter any special rules for this project"
                          {...field}
                          disabled={isSubmitting}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="project_rules_reviewer_name"
                  render={({ field }) => (
                    <FormItem className="sm:col-span-2">
                      <FormLabel>Project Rules Reviewer</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter name of rules reviewer"
                          {...field}
                          disabled={isSubmitting}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="additional_review_process"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Additional Review Process</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select..." />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value={AdditionalReviewProcess.required}>
                            Required
                          </SelectItem>
                          <SelectItem
                            value={AdditionalReviewProcess.not_required}
                          >
                            Not Required
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="major_project_indicator"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Major Project</FormLabel>
                        <FormDescription>
                          Is this a major project requiring special attention?
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
