import React, { useEffect } from "react";
import { Save, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  useProject,
  useCreateProject,
  useUpdateProject,
} from "@/hooks/useProjects";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { tryCatch } from "@/lib/utils";

const formSchema = z.object({
  project_name: z.string().min(1, "Project name is required"),
  project_type: z.string().min(1, "Project type is required"),
});

type FormData = z.infer<typeof formSchema>;

interface ProjectFormProps {
  projectId?: string;
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function ProjectForm({
  projectId,
  open,
  onClose,
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
      project_name: "",
      project_type: "",
    },
  });

  useEffect(() => {
    if (isEditing && existingProject) {
      form.reset({
        project_name: existingProject.project_name,
        project_type: existingProject.project_type,
      });
    } else if (!isEditing && open) {
      form.reset({
        project_name: "",
        project_type: "",
      });
    }
  }, [existingProject, form, isEditing, open]);

  const onSubmit = async (data: FormData) => {
    const { error } = await tryCatch(async () => {
      if (isEditing) {
        await updateProject.mutateAsync({
          id: projectId!,
          data,
        });
        toast.success("Project updated successfully");
      } else {
        await createProject.mutateAsync({
          ...data,
        });
        toast.success("Project added successfully");
      }

      if (onSuccess) {
        onSuccess();
      }
      onClose();
    });

    if (error) {
      console.error(error);
      toast.error(
        isEditing ? "Failed to update project" : "Failed to create project"
      );
    }
  };

  const isSubmitting = createProject.isPending || updateProject.isPending;

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
            {isEditing ? "Edit Project" : "Add New Project"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Update project details."
              : "Enter details for the new project."}
          </DialogDescription>
        </DialogHeader>

        {isEditing && isLoadingProject ? (
          <div className="flex justify-center items-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
                        placeholder="Enter project type"
                        {...field}
                        disabled={isSubmitting}
                      />
                    </FormControl>
                    <FormMessage />
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
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
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
