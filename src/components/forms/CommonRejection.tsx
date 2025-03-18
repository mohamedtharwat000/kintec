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
  useCommonRejection,
  useCreateCommonRejection,
  useUpdateCommonRejection,
} from "@/hooks/useCommonRejection";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { tryCatch } from "@/lib/utils";
import { CommonRejectionType } from "@/types/CommonRejection";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

const formSchema = z.object({
  common_rejection_type: z.nativeEnum(CommonRejectionType),
  resolution_process: z.string().min(1, "Resolution process is required"),
});

type FormData = z.infer<typeof formSchema>;

interface CommonRejectionFormProps {
  rejectionId?: string;
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function CommonRejectionForm({
  rejectionId,
  open,
  onClose,
  onSuccess,
}: CommonRejectionFormProps) {
  const isEditing = !!rejectionId;
  const { data: existingRejection, isLoading: isLoadingRejection } =
    useCommonRejection(rejectionId);

  const createRejection = useCreateCommonRejection();
  const updateRejection = useUpdateCommonRejection();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      common_rejection_type: CommonRejectionType.contractor,
      resolution_process: "",
    },
  });

  useEffect(() => {
    if (isEditing && existingRejection) {
      form.reset({
        common_rejection_type:
          existingRejection.common_rejection_type as CommonRejectionType,
        resolution_process: existingRejection.resolution_process,
      });
    } else if (!isEditing && open) {
      form.reset({
        common_rejection_type: CommonRejectionType.contractor,
        resolution_process: "",
      });
    }
  }, [existingRejection, form, isEditing, open]);

  const onSubmit = async (data: FormData) => {
    const { error } = await tryCatch(async () => {
      if (isEditing) {
        await updateRejection.mutateAsync({
          id: rejectionId!,
          data,
        });
        toast.success("Rejection reason updated successfully");
      } else {
        await createRejection.mutateAsync(data);
        toast.success("Rejection reason added successfully");
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
          ? "Failed to update rejection reason"
          : "Failed to create rejection reason"
      );
    }
  };

  const isSubmitting = createRejection.isPending || updateRejection.isPending;

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
            {isEditing ? "Edit Rejection Reason" : "Add New Rejection Reason"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Update rejection reason details."
              : "Enter details for the new rejection reason."}
          </DialogDescription>
        </DialogHeader>

        {isEditing && isLoadingRejection ? (
          <div className="flex justify-center items-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="common_rejection_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Rejection Type</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      disabled={isSubmitting}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select rejection type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value={CommonRejectionType.contractor}>
                          Contractor
                        </SelectItem>
                        <SelectItem value={CommonRejectionType.client}>
                          Client
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="resolution_process"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Resolution Process</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Describe the resolution process..."
                        {...field}
                        disabled={isSubmitting}
                        className="min-h-[100px]"
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
