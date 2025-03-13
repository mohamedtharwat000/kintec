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
  useRpoRule,
  useCreateRpoRule,
  useUpdateRpoRule,
} from "@/hooks/useRpoRules";
import { usePurchaseOrders } from "@/hooks/usePurchaseOrders";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

const formSchema = z.object({
  PO_id: z.string().min(1, "Purchase Order ID is required"),
  RPO_number_format: z.string().optional(),
  final_invoice_label: z.string().optional(),
  RPO_extension_handling: z.string().optional(),
  mob_demob_fee_rules: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

interface PoRuleFormProps {
  ruleId?: string;
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function PoRuleForm({
  ruleId,
  open,
  onClose,
  onSuccess,
}: PoRuleFormProps) {
  const isEditing = !!ruleId;
  const { data: existingRule, isLoading: isLoadingRule } = useRpoRule(
    ruleId || ""
  );

  const { data: purchaseOrders = [] } = usePurchaseOrders();
  const createRpoRule = useCreateRpoRule();
  const updateRpoRule = useUpdateRpoRule();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      PO_id: "",
      RPO_number_format: "",
      final_invoice_label: "",
      RPO_extension_handling: "",
      mob_demob_fee_rules: "",
    },
  });

  useEffect(() => {
    if (isEditing && existingRule) {
      form.reset({
        PO_id: existingRule.PO_id,
        RPO_number_format: existingRule.RPO_number_format || "",
        final_invoice_label: existingRule.final_invoice_label || "",
        RPO_extension_handling: existingRule.RPO_extension_handling || "",
        mob_demob_fee_rules: existingRule.mob_demob_fee_rules || "",
      });
    } else if (!isEditing && open) {
      // Reset form when opening in create mode
      form.reset({
        PO_id: "",
        RPO_number_format: "",
        final_invoice_label: "",
        RPO_extension_handling: "",
        mob_demob_fee_rules: "",
      });
    }
  }, [existingRule, form, isEditing, open]);

  const onSubmit = async (data: FormData) => {
    try {
      if (isEditing) {
        await updateRpoRule.mutateAsync({
          id: ruleId!,
          data: {
            ...data,
          },
        });
        toast.success("Purchase Order Rule updated successfully");
      } else {
        await createRpoRule.mutateAsync({
          ...data,
        });
        toast.success("Purchase Order Rule added successfully");
      }

      if (onSuccess) {
        onSuccess();
      }
      onClose();
    } catch (error) {
      console.error(error);
      toast.error(
        isEditing
          ? "Failed to update Purchase Order Rule"
          : "Failed to create Purchase Order Rule"
      );
    }
  };

  const isSubmitting = createRpoRule.isPending || updateRpoRule.isPending;

  // Filter out POs that already have rules assigned
  const availablePOs = isEditing
    ? purchaseOrders
    : purchaseOrders.filter((po) => !po.RPO_rules || po.RPO_rules.length === 0);

  return (
    <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {isEditing
              ? "Edit Purchase Order Rule"
              : "Add New Purchase Order Rule"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Update purchase order rule details."
              : "Enter details for the new purchase order rule."}
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
                name="PO_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Purchase Order</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      value={field.value}
                      disabled={isSubmitting || isEditing}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a purchase order" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {availablePOs.map((po) => (
                          <SelectItem key={po.PO_id} value={po.PO_id}>
                            {po.PO_id} - {po.contract?.job_title || "N/A"}
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
                name="RPO_number_format"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Number Format</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g., RPO-{YYYY}-{0000}"
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
                name="RPO_extension_handling"
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
