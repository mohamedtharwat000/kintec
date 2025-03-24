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
  useInvoiceFormattingRule,
  useCreateInvoiceFormattingRule,
  useUpdateInvoiceFormattingRule,
} from "@/hooks/useInvoiceFormattingRules";
import { useInvoices } from "@/hooks/useInvoices";
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
  invoice_id: z.string().min(1, "Invoice is required"),
  file_format: z.string().optional().nullable(),
  required_invoice_fields: z.string().optional().nullable(),
  attachment_requirements: z.string().optional().nullable(),
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
    const { error } = await tryCatch(async () => {
      if (isEditing) {
        await updateRule.mutateAsync({
          id: ruleId!,
          data: {
            ...data,
          },
        });
        toast.success("Invoice formatting rule updated successfully");
      } else {
        await createRule.mutateAsync({
          invoice_id: data.invoice_id,
          file_format: data.file_format || null,
          required_invoice_fields: data.required_invoice_fields || null,
          attachment_requirements: data.attachment_requirements || null,
        });
        toast.success("Invoice formatting rule added successfully");
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
          ? "Failed to update invoice formatting rule"
          : "Failed to create invoice formatting rule"
      );
    }
  };

  const isSubmitting = createRule.isPending || updateRule.isPending;

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
            {isEditing ? "Edit Formatting Rule" : "Add New Formatting Rule"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Update invoice formatting rule details."
              : "Define formatting requirements for invoices."}
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
                          <SelectValue placeholder="Select an invoice" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {invoices.map((invoice) => (
                          <SelectItem
                            key={invoice.invoice_id}
                            value={invoice.invoice_id}
                          >
                            {invoice.invoice_id}
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
                        placeholder="e.g., PDF, Excel, etc."
                        {...field}
                        value={field.value || ""}
                        disabled={isSubmitting}
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
                      <Input
                        placeholder="e.g., Date, Invoice Number, etc."
                        {...field}
                        value={field.value || ""}
                        disabled={isSubmitting}
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
                      <Input
                        placeholder="e.g., Timesheets, Receipts, etc."
                        {...field}
                        value={field.value || ""}
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
