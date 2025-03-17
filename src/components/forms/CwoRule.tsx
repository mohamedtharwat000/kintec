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
import { tryCatch } from "@/lib/utils";

const formSchema = z.object({
  CWO_id: z.string().min(1, "Call-off Work Order is required"),
  CWO_number_format: z.string().optional().nullable(),
  final_invoice_label: z.string().optional().nullable(),
  CWO_extension_handling: z.string().optional().nullable(),
  mob_demob_fee_rules: z.string().optional().nullable(),
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
  const { data: existingRule, isLoading: isLoadingRule } = useCwoRule(ruleId);
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
    const { error } = await tryCatch(async () => {
      if (isEditing) {
        await updateCwoRule.mutateAsync({
          id: ruleId!,
          // @ts-ignore - Backend handles null/undefined fields
          data: {
            ...data,
          },
        });
        toast.success("CWO rule updated successfully");
      } else {
        // @ts-ignore - Backend handles null/undefined fields
        await createCwoRule.mutateAsync({
          ...data,
        });
        toast.success("CWO rule added successfully");
      }

      if (onSuccess) {
        onSuccess();
      }
      onClose();
    });

    if (error) {
      console.error(error);
      toast.error(
        isEditing ? "Failed to update CWO rule" : "Failed to create CWO rule"
      );
    }
  };

  const isSubmitting = createCwoRule.isPending || updateCwoRule.isPending;

  // Filter calloff work orders to show only those without rules (except current one when editing)
  const availableCWOs = isEditing
    ? calloffWorkOrders
    : calloffWorkOrders.filter(
        (cwo) => !cwo.CWO_rules || cwo.CWO_rules.length === 0
      );

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
            {isEditing ? "Edit CWO Rule" : "Add New CWO Rule"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Update rule details for call-off work order."
              : "Define rules for call-off work order processing."}
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
                          <SelectValue placeholder="Select a Call-off Work Order" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {availableCWOs.map((cwo) => (
                          <SelectItem key={cwo.CWO_id} value={cwo.CWO_id}>
                            {cwo.contract?.job_title || cwo.CWO_id}
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
                    <FormLabel>CWO Number Format</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g., CWO-YYYY-####"
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
                name="final_invoice_label"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Final Invoice Label</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g., FINAL INVOICE"
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
                name="CWO_extension_handling"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>CWO Extension Handling</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g., Require approval"
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
                name="mob_demob_fee_rules"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mobilization/Demobilization Fee Rules</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g., One-time fee of £500"
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
