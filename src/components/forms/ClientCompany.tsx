import React, { useEffect } from "react";
import { Save, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useClient, useCreateClient, useUpdateClient } from "@/hooks/useApp";
import { ClientCompany } from "@/types/ClientCompany";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

const formSchema = z.object({
  client_company_id: z.string().min(1, "Company ID is required"),
  client_name: z.string().min(1, "Company name is required"),
  contact_email: z.string().email("Invalid email address"),
  invoice_submission_deadline: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

interface ClientFormProps {
  clientId?: string;
  onCancel: () => void;
  onSuccess?: () => void;
}

export function ClientForm({ clientId, onCancel, onSuccess }: ClientFormProps) {
  const isEditing = !!clientId;
  const { data: existingClient, isLoading: isLoadingClient } = useClient(
    clientId || ""
  );

  const createClient = useCreateClient();
  const updateClient = useUpdateClient();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      client_company_id: "",
      client_name: "",
      contact_email: "",
      invoice_submission_deadline: "",
    },
  });

  // Populate form when editing existing client
  useEffect(() => {
    if (isEditing && existingClient) {
      form.reset({
        client_company_id: existingClient.client_company_id,
        client_name: existingClient.client_name,
        contact_email: existingClient.contact_email,
        invoice_submission_deadline:
          existingClient.invoice_submission_deadline || "",
      });
    }
  }, [existingClient, form, isEditing]);

  const onSubmit = async (data: FormData) => {
    try {
      if (isEditing) {
        await updateClient.mutateAsync({
          id: clientId,
          data: {
            ...data,
            invoice_submission_deadline:
              data.invoice_submission_deadline || undefined,
          },
        });
        toast.success("Company updated successfully");
      } else {
        await createClient.mutateAsync({
          ...data,
          invoice_submission_deadline:
            data.invoice_submission_deadline || undefined,
        } as Omit<ClientCompany, "id">);
        toast.success("Company added successfully");
      }

      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error(error);
      toast.error(
        isEditing ? "Failed to update company" : "Failed to create company"
      );
    }
  };

  const isSubmitting = createClient.isPending || updateClient.isPending;

  if (isEditing && isLoadingClient) {
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
              {isEditing ? "Edit Company" : "Add New Company"}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {isEditing
                ? "Update the company details below"
                : "Complete the required details to add a new company."}
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
                  name="client_company_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Company ID</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g., COMP001"
                          {...field}
                          disabled={isEditing || isSubmitting} // ID shouldn't be editable
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="client_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Company Name</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter company name"
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
                    <FormItem className="sm:col-span-2">
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
                    <FormItem className="sm:col-span-2">
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
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
