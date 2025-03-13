import React, { useEffect } from "react";
import { Save, Loader2 } from "lucide-react";
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
  useCwoRule,
  useCreateCwoRule,
  useUpdateCwoRule,
} from "@/hooks/useCwoRules";
import { useCalloffWorkOrders } from "@/hooks/useCalloffWorkOrders";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

const formSchema = z.object({
  CWO_id: z.string().min(1, "Call-off Work Order ID is required"),
  CWO_number_format: z.string().optional(),
  final_invoice_label: z.string().optional(),
  CWO_extension_handling: z.string().optional(),
  mob_demob_fee_rules: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

interface CwoRuleFormProps {
  ruleId?: string;
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function CwoRuleForm({
  ruleId,
  open,
  onClose,
  onSuccess,
}: CwoRuleFormProps) {
  const isEditing = !!ruleId;
  const { data: existingRule, isLoading: isLoadingRule } = useCwoRule(
    ruleId || ""
  );

  const { data: calloffWorkOrders = [] } = useCalloffWorkOrders();
  const createCwoRule = useCreateCwoRule();
  const updateCwoRule = useUpdateCwoRule();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      CWO_id: "",
      CWO_number_format: "",
      final_invoice_label: "",
      CWO_extension_handling: "",
      mob_demob_fee_rules: "",
    },
  });

  useEffect(() => {
    if (isEditing && existingRule) {
      form.reset({
        CWO_id: existingRule.CWO_id,
        CWO_number_format: existingRule.CWO_number_format || "",
        final_invoice_label: existingRule.final_invoice_label || "",
        CWO_extension_handling: existingRule.CWO_extension_handling || "",
        mob_demob_fee_rules: existingRule.mob_demob_fee_rules || "",
      });
    } else if (!isEditing && open) {
      // Reset form when opening in create mode
      form.reset({
        CWO_id: "",
        CWO_number_format: "",
        final_invoice_label: "",
        CWO_extension_handling: "",
        mob_demob_fee_rules: "",
      });
    }
  }, [existingRule, form, isEditing, open]);

  const onSubmit = async (data: FormData) => {
    try {
      if (isEditing) {
        await updateCwoRule.mutateAsync({
          id: ruleId!,
          data: {
            ...data,
          },
        });
        toast.success("Call-off Work Order Rule updated successfully");
      } else {
        await createCwoRule.mutateAsync({
          ...data,
        });
        toast.success("Call-off Work Order Rule added successfully");
      }

      if (onSuccess) {
        onSuccess();
      }
      onClose();
    } catch (error) {
      console.error(error);
      toast.error(
        isEditing
          ? "Failed to update Call-off Work Order Rule"
          : "Failed to create Call-off Work Order Rule"
      );
    }
  };

  const isSubmitting = createCwoRule.isPending || updateCwoRule.isPending;

  // Filter out CWOs that already have rules assigned
  const availableCWOs = isEditing
    ? calloffWorkOrders
    : calloffWorkOrders.filter(
        (cwo) => !cwo.CWO_rules || cwo.CWO_rules.length === 0
      );

  return (
    <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {isEditing
              ? "Edit Call-off Work Order Rule"
              : "Add New Call-off Work Order Rule"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Update call-off work order rule details."
              : "Enter details for the new call-off work order rule."}
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
                name="CWO_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Call-off Work Order</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      value={field.value}
                      disabled={isSubmitting || isEditing}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a call-off work order" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {availableCWOs.map((cwo) => (
                          <SelectItem key={cwo.CWO_id} value={cwo.CWO_id}>
                            {cwo.CWO_id} - {cwo.contract?.job_title || "N/A"}
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
                name="CWO_number_format"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Number Format</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g., CWO-{YYYY}-{0000}"
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
                name="final_invoice_label"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Final Invoice Label</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g., FINAL INVOICE"
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
                name="CWO_extension_handling"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Extension Handling</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Enter extension handling rules..."
                        className="min-h-[100px]"
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
                name="mob_demob_fee_rules"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mobilization/Demobilization Fee Rules</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Enter mobilization/demobilization fee rules..."
                        className="min-h-[100px]"
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
