import React, { useEffect } from "react";
import { Save, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  useProjectRule,
  useCreateProjectRule,
  useUpdateProjectRule,
} from "@/hooks/useProjectRules";
import { useProjects } from "@/hooks/useProjects";
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
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { AdditionalReviewProcess } from "@/types/ProjectRule";
import { tryCatch } from "@/lib/utils";

const formSchema = z.object({
  project_id: z.string().min(1, "Project is required"),
  special_project_rules: z.string().optional(),
  project_rules_reviewer_name: z.string().optional(),
  additional_review_process: z.enum(["required", "not_required"]).optional(),
  major_project_indicator: z.boolean().optional(),
});

type FormData = z.infer<typeof formSchema>;

interface ProjectRuleFormProps {
  projectRuleId?: string;
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function ProjectRuleForm({
  projectRuleId,
  open,
  onClose,
  onSuccess,
}: ProjectRuleFormProps) {
  const isEditing = !!projectRuleId;
  const { data: existingProjectRule, isLoading: isLoadingProjectRule } =
    useProjectRule(projectRuleId || "");
  const { data: projects = [] } = useProjects();
  const createProjectRule = useCreateProjectRule();
  const updateProjectRule = useUpdateProjectRule();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      project_id: "",
      special_project_rules: "",
      project_rules_reviewer_name: "",
      additional_review_process: undefined,
      major_project_indicator: false,
    },
  });

  // Populate form when editing existing project rule
  useEffect(() => {
    if (isEditing && existingProjectRule) {
      form.reset({
        project_id: existingProjectRule.project_id,
        special_project_rules: existingProjectRule.special_project_rules || "",
        project_rules_reviewer_name:
          existingProjectRule.project_rules_reviewer_name || "",
        additional_review_process:
          existingProjectRule.additional_review_process ?? undefined,
        major_project_indicator:
          existingProjectRule.major_project_indicator || false,
      });
    } else if (!isEditing && open) {
      form.reset({
        project_id: "",
        special_project_rules: "",
        project_rules_reviewer_name: "",
        additional_review_process: undefined,
        major_project_indicator: false,
      });
    }
  }, [existingProjectRule, form, isEditing, open]);

  const onSubmit = async (data: FormData) => {
    const { error } = await tryCatch(async () => {
      if (isEditing) {
        await updateProjectRule.mutateAsync({
          id: projectRuleId!,
          data: {
            ...data,
            additional_review_process: data.additional_review_process ?? null,
          },
        });
        toast.success("Project rule updated successfully");
      } else {
        await createProjectRule.mutateAsync({
          ...data,
          special_project_rules: data.special_project_rules || null,
          project_rules_reviewer_name: data.project_rules_reviewer_name || null,
          additional_review_process: data.additional_review_process || null,
          major_project_indicator: data.major_project_indicator || null,
        });
        toast.success("Project rule added successfully");
      }

      if (onSuccess) {
        onSuccess();
      }
      onClose();
    });

    if (error) {
      console.error(error);
      toast.error(
        isEditing
          ? "Failed to update project rule"
          : "Failed to create project rule"
      );
    }
  };

  const isSubmitting =
    createProjectRule.isPending || updateProjectRule.isPending;

  return (
    <Dialog
      open={open}
      onOpenChange={(open) => {
        if (!isSubmitting && !open) {
          onClose();
        }
      }}
    >
      <DialogContent className="max-w-[80vw] max-h-[80vh] overflow-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Edit Project Rule" : "Add New Project Rule"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Update the project rule information."
              : "Enter details for the new project rule."}
          </DialogDescription>
        </DialogHeader>

        {isEditing && isLoadingProjectRule ? (
          <div className="flex justify-center items-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="project_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Project</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      disabled={isEditing || isSubmitting}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a project" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {projects.map((project) => (
                          <SelectItem
                            key={project.project_id}
                            value={project.project_id}
                          >
                            {project.project_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="project_rules_reviewer_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Reviewer Name</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Enter reviewer name"
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
                name="special_project_rules"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Special Project Rules</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Enter special project rules"
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
                      disabled={isSubmitting}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select review process" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="required">Required</SelectItem>
                        <SelectItem value="not_required">
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
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                    <div className="space-y-0.5">
                      <FormLabel>Major Project</FormLabel>
                      <FormDescription>
                        Indicate if this is a major project
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value || false}
                        onCheckedChange={field.onChange}
                        disabled={isSubmitting}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <DialogFooter className="pt-4">
                <Button
                  variant="outline"
                  onClick={onClose}
                  disabled={isSubmitting}
                  type="button"
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {isEditing ? "Updating..." : "Saving..."}
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      {isEditing ? "Update" : "Save"}
                    </>
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  );
}
