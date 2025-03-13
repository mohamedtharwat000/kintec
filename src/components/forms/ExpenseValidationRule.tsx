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
  useExpenseValidationRule,
  useCreateExpenseValidationRule,
  useUpdateExpenseValidationRule,
} from "@/hooks/useExpenseValidationRules";
import { useExpenses } from "@/hooks/useExpenses";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

const formSchema = z.object({
  expense_id: z.string().min(1, "Expense ID is required"),
  allowable_expense_types: z.string().optional(),
  expense_documentation: z.string().optional(),
  supporting_documentation_type: z.string().optional(),
  expense_limit: z.string().optional(),
  reimbursement_rule: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

interface ExpenseValidationRuleFormProps {
  ruleId?: string;
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function ExpenseValidationRuleForm({
  ruleId,
  open,
  onClose,
  onSuccess,
}: ExpenseValidationRuleFormProps) {
  const isEditing = !!ruleId;
  const { data: existingRule, isLoading: isLoadingRule } =
    useExpenseValidationRule(ruleId || "");
  const { data: expenses = [] } = useExpenses();

  const createRule = useCreateExpenseValidationRule();
  const updateRule = useUpdateExpenseValidationRule();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      expense_id: "",
      allowable_expense_types: "",
      expense_documentation: "",
      supporting_documentation_type: "",
      expense_limit: "",
      reimbursement_rule: "",
    },
  });

  useEffect(() => {
    if (isEditing && existingRule) {
      form.reset({
        expense_id: existingRule.expense_id,
        allowable_expense_types: existingRule.allowable_expense_types || "",
        expense_documentation: existingRule.expense_documentation || "",
        supporting_documentation_type:
          existingRule.supporting_documentation_type || "",
        expense_limit: existingRule.expense_limit || "",
        reimbursement_rule: existingRule.reimbursement_rule || "",
      });
    } else if (!isEditing && open) {
      // Reset form when opening in create mode
      form.reset({
        expense_id: "",
        allowable_expense_types: "",
        expense_documentation: "",
        supporting_documentation_type: "",
        expense_limit: "",
        reimbursement_rule: "",
      });
    }
  }, [existingRule, form, isEditing, open]);

  const onSubmit = async (data: FormData) => {
    try {
      if (isEditing) {
        await updateRule.mutateAsync({
          id: ruleId,
          data,
        });
        toast.success("Validation rule updated successfully");
      } else {
        await createRule.mutateAsync(data);
        toast.success("Validation rule added successfully");
      }

      if (onSuccess) {
        onSuccess();
      }
      onClose();
    } catch (error) {
      console.error(error);
      toast.error(
        isEditing
          ? "Failed to update validation rule"
          : "Failed to create validation rule"
      );
    }
  };

  const isSubmitting = createRule.isPending || updateRule.isPending;

  return (
    <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Edit Validation Rule" : "Add New Validation Rule"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Update validation rule details."
              : "Enter details for the new validation rule."}
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
                name="expense_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Expense</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      value={field.value}
                      disabled={isSubmitting || isEditing}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select an expense" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {expenses.map((expense) => (
                          <SelectItem
                            key={expense.expense_id}
                            value={expense.expense_id}
                          >
                            {expense.expense_id.substring(0, 8)}... -{" "}
                            {expense.expense_type} ({expense.expense_value}{" "}
                            {expense.expsense_currency})
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
                name="allowable_expense_types"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Allowable Expense Types</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g., travel, meals, accommodation"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="expense_documentation"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Expense Documentation</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g., receipt, invoice"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="supporting_documentation_type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Supporting Documentation Type</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g., approval form, expense report"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="expense_limit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Expense Limit</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g., 1000 USD per month"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="reimbursement_rule"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Reimbursement Rule</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Enter reimbursement rules and guidelines..."
                        className="min-h-20"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter className="mt-6">
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
