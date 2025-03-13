import React, { useEffect } from "react";
import { Save, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  useInvoiceFormattingRule,
  useCreateInvoiceFormattingRule,
  useUpdateInvoiceFormattingRule,
} from "@/hooks/useInvoiceFormattingRules";
import { useInvoices } from "@/hooks/useInvoices";

const formSchema = z.object({
  invoice_id: z.string().min(1, "Invoice is required"),
  file_format: z.string().optional(),
  required_invoice_fields: z.string().optional(),
  attachment_requirements: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

interface InvoiceFormattingRuleFormProps {
  ruleId?: string;
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function InvoiceFormattingRuleForm({
  ruleId,
  open,
  onClose,
  onSuccess,
}: InvoiceFormattingRuleFormProps) {
  const isEditing = !!ruleId;
  const { data: existingRule, isLoading: isLoadingRule } =
    useInvoiceFormattingRule(ruleId || "");

  const { data: invoices = [] } = useInvoices();
  const createRule = useCreateInvoiceFormattingRule();
  const updateRule = useUpdateInvoiceFormattingRule();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      invoice_id: "",
      file_format: "",
      required_invoice_fields: "",
      attachment_requirements: "",
    },
  });

  useEffect(() => {
    if (isEditing && existingRule) {
      form.reset({
        invoice_id: existingRule.invoice_id,
        file_format: existingRule.file_format || "",
        required_invoice_fields: existingRule.required_invoice_fields || "",
        attachment_requirements: existingRule.attachment_requirements || "",
      });
    } else if (!isEditing && open) {
      // Reset form when opening in create mode
      form.reset({
        invoice_id: "",
        file_format: "",
        required_invoice_fields: "",
        attachment_requirements: "",
      });
    }
  }, [existingRule, form, isEditing, open]);

  const onSubmit = async (data: FormData) => {
    try {
      if (isEditing) {
        await updateRule.mutateAsync({
          id: ruleId,
          data: {
            ...data,
          },
        });
        toast.success("Invoice formatting rule updated successfully");
      } else {
        await createRule.mutateAsync({
          ...data,
        });
        toast.success("Invoice formatting rule added successfully");
      }

      if (onSuccess) {
        onSuccess();
      }
      onClose();
    } catch (error) {
      console.error(error);
      toast.error(
        isEditing
          ? "Failed to update invoice formatting rule"
          : "Failed to create invoice formatting rule"
      );
    }
  };

  const isSubmitting = createRule.isPending || updateRule.isPending;

  return (
    <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Edit Formatting Rule" : "Add New Formatting Rule"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Update formatting rule details."
              : "Enter details for the new formatting rule."}
          </DialogDescription>
        </DialogHeader>

        {isEditing && isLoadingRule ? (
          <div className="flex justify-center items-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="invoice_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Invoice</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      value={field.value}
                      disabled={isSubmitting}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select invoice" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {invoices.map((invoice) => (
                          <SelectItem
                            key={invoice.invoice_id}
                            value={invoice.invoice_id}
                          >
                            {invoice.invoice_id} - {invoice.invoice_currency}{" "}
                            {invoice.invoice_total_value}
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
                name="file_format"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>File Format</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g., PDF, Excel, CSV"
                        {...field}
                        value={field.value || ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="required_invoice_fields"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Required Invoice Fields</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="List required fields for the invoice, separated by commas"
                        className="min-h-20"
                        {...field}
                        value={field.value || ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="attachment_requirements"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Attachment Requirements</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Specify any requirements for attachments to the invoice"
                        className="min-h-20"
                        {...field}
                        value={field.value || ""}
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
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4 mr-2" />
                  )}
                  {isEditing ? "Update" : "Save"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  );
}
