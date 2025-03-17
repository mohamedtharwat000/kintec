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
  useClient,
  useCreateClient,
  useUpdateClient,
} from "@/hooks/useClientCompany";
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
  client_name: z.string().min(1, "Company name is required"),
  contact_email: z.string().email("Invalid email address"),
  invoice_submission_deadline: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

interface ClientFormProps {
  clientId?: string;
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function ClientForm({
  clientId,
  open,
  onClose,
  onSuccess,
}: ClientFormProps) {
  const isEditing = !!clientId;
  const { data: existingClient, isLoading: isLoadingClient } =
    useClient(clientId);

  const createClient = useCreateClient();
  const updateClient = useUpdateClient();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      client_name: "",
      contact_email: "",
      invoice_submission_deadline: "",
    },
  });

  useEffect(() => {
    if (isEditing && existingClient) {
      form.reset({
        client_name: existingClient.client_name,
        contact_email: existingClient.contact_email,
        invoice_submission_deadline:
          existingClient.invoice_submission_deadline || "",
      });
    } else if (!isEditing && open) {
      form.reset({
        client_name: "",
        contact_email: "",
        invoice_submission_deadline: "",
      });
    }
  }, [existingClient, form, isEditing, open]);

  const onSubmit = async (data: FormData) => {
    const { error } = await tryCatch(async () => {
      if (isEditing) {
        await updateClient.mutateAsync({
          id: clientId!,
          data,
        });
        toast.success("Company updated successfully");
      } else {
        await createClient.mutateAsync({
          ...data,
          invoice_submission_deadline: data.invoice_submission_deadline || null,
        });
        toast.success("Company added successfully");
      }

      if (onSuccess) {
        onSuccess();
      }
      onClose();
    });

    if (error) {
      console.error(error);
      toast.error(
        isEditing ? "Failed to update company" : "Failed to create company"
      );
    }
  };

  const isSubmitting = createClient.isPending || updateClient.isPending;

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
            {isEditing ? "Edit Company" : "Add New Company"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Update company details."
              : "Enter details for the new company."}
          </DialogDescription>
        </DialogHeader>

        {isEditing && isLoadingClient ? (
          <div className="flex justify-center items-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="client_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Company Name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Acme Corp"
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
                name="contact_email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contact Email</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="email@example.com"
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
                name="invoice_submission_deadline"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Invoice Submission Deadline</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g., 15th of each month"
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
