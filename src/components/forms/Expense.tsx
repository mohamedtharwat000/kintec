import React, { useEffect } from "react";
import { Save, Loader2, DollarSign } from "lucide-react";
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
  useExpense,
  useCreateExpense,
  useUpdateExpense,
} from "@/hooks/useExpenses";
import { ExpenseType, ExpenseFrequency } from "@/types/Expense";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { usePurchaseOrders } from "@/hooks/usePurchaseOrders";
import { useCalloffWorkOrders } from "@/hooks/useCalloffWorkOrders";
import { tryCatch } from "@/lib/utils";

const formSchema = z
  .object({
    expense_type: z.nativeEnum(ExpenseType, {
      required_error: "Expense type is required",
    }),
    expense_frequency: z.nativeEnum(ExpenseFrequency, {
      required_error: "Expense frequency is required",
    }),
    expense_value: z.coerce
      .number()
      .min(0, "Value must be positive")
      .refine((val) => !isNaN(val), {
        message: "Please enter a valid number",
      }),
    expsense_currency: z.string().min(1, "Currency is required"),
    pro_rata_percentage: z.coerce
      .number()
      .min(0, "Percentage must be positive")
      .max(100, "Percentage cannot exceed 100%")
      .default(100),
    PO_id: z.string().optional(),
    CWO_id: z.string().optional(),
  })
  .refine(
    (data) => {
      // Either PO_id or CWO_id must be provided, but not both
      return (data.PO_id && !data.CWO_id) || (!data.PO_id && data.CWO_id);
    },
    {
      message:
        "Either select a Purchase Order or a Call-off Work Order (not both)",
      path: ["PO_id"],
    }
  );

type FormData = z.infer<typeof formSchema>;

interface ExpenseFormProps {
  expenseId?: string;
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function ExpenseForm({
  expenseId,
  open,
  onClose,
  onSuccess,
}: ExpenseFormProps) {
  const isEditing = !!expenseId;
  const { data: existingExpense, isLoading: isLoadingExpense } = useExpense(
    expenseId || ""
  );
  const { data: purchaseOrders = [] } = usePurchaseOrders();
  const { data: calloffWorkOrders = [] } = useCalloffWorkOrders();

  const createExpense = useCreateExpense();
  const updateExpense = useUpdateExpense();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      expense_type: ExpenseType.charged,
      expense_frequency: ExpenseFrequency.monthly,
      expense_value: 0,
      expsense_currency: "USD",
      pro_rata_percentage: 100,
      PO_id: undefined,
      CWO_id: undefined,
    },
  });

  // Safe function to get number value from potential Decimal object
  const safelyGetNumber = (value: any): number => {
    if (typeof value === "number") return value;
    if (value === null || value === undefined) return 0;
    // Handle Decimal objects from Prisma
    if (
      typeof value === "object" &&
      value !== null &&
      "toNumber" in value &&
      typeof value.toNumber === "function"
    ) {
      return value.toNumber();
    }
    return Number(value) || 0;
  };

  useEffect(() => {
    if (isEditing && existingExpense) {
      form.reset({
        expense_type: existingExpense.expense_type as ExpenseType,
        expense_frequency:
          existingExpense.expense_frequency as ExpenseFrequency,
        expense_value: safelyGetNumber(existingExpense.expense_value),
        expsense_currency: existingExpense.expsense_currency,
        pro_rata_percentage: existingExpense.pro_rata_percentage,
        PO_id: existingExpense.PO_id || undefined,
        CWO_id: existingExpense.CWO_id || undefined,
      });
    } else if (!isEditing && open) {
      // Reset form when opening in create mode
      form.reset({
        expense_type: ExpenseType.charged,
        expense_frequency: ExpenseFrequency.monthly,
        expense_value: 0,
        expsense_currency: "USD",
        pro_rata_percentage: 100,
        PO_id: undefined,
        CWO_id: undefined,
      });
    }
  }, [existingExpense, form, isEditing, open]);

  const onSubmit = async (data: FormData) => {
    const { error } = await tryCatch(async () => {
      if (isEditing) {
        await updateExpense.mutateAsync({
          id: expenseId!,
          // @ts-ignore - Backend handles conversion of values
          data,
        });
        toast.success("Expense updated successfully");
      } else {
        // @ts-ignore - Backend handles conversion of values
        await createExpense.mutateAsync(data);
        toast.success("Expense added successfully");
      }

      if (onSuccess) {
        onSuccess();
      }
      onClose();
    });

    if (error) {
      console.error(error);
      toast.error(
        isEditing ? "Failed to update expense" : "Failed to create expense"
      );
    }
  };

  const isSubmitting = createExpense.isPending || updateExpense.isPending;
  const orderTypeSelected = !!form.watch("PO_id") || !!form.watch("CWO_id");

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
            {isEditing ? "Edit Expense" : "Add New Expense"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Update expense details."
              : "Enter details for the new expense."}
          </DialogDescription>
        </DialogHeader>

        {isEditing && isLoadingExpense ? (
          <div className="flex justify-center items-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="expense_type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Expense Type</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        value={field.value}
                        disabled={isSubmitting}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {Object.values(ExpenseType).map((type) => (
                            <SelectItem key={type} value={type}>
                              {type.charAt(0).toUpperCase() + type.slice(1)}
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
                  name="expense_frequency"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Expense Frequency</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        value={field.value}
                        disabled={isSubmitting}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select frequency" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {Object.values(ExpenseFrequency).map((frequency) => (
                            <SelectItem key={frequency} value={frequency}>
                              {frequency.charAt(0).toUpperCase() +
                                frequency.slice(1)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="expense_value"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Expense Value</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <DollarSign className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                          <Input
                            type="number"
                            step="0.01"
                            className="pl-8"
                            {...field}
                            onChange={(e) =>
                              field.onChange(parseFloat(e.target.value))
                            }
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="expsense_currency"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Currency</FormLabel>
                      <FormControl>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          value={field.value}
                          disabled={isSubmitting}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select currency" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="USD">USD - US Dollar</SelectItem>
                            <SelectItem value="EUR">EUR - Euro</SelectItem>
                            <SelectItem value="GBP">
                              GBP - British Pound
                            </SelectItem>
                            <SelectItem value="JPY">
                              JPY - Japanese Yen
                            </SelectItem>
                            <SelectItem value="AUD">
                              AUD - Australian Dollar
                            </SelectItem>
                            <SelectItem value="CAD" />
                            CAD - Canadian Dollar
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="pro_rata_percentage"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Pro Rata Percentage</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type="number"
                          min="0"
                          max="100"
                          step="1"
                          {...field}
                          onChange={(e) =>
                            field.onChange(parseFloat(e.target.value))
                          }
                        />
                        <span className="absolute right-3 top-1/2 transform -translate-y-1/2">
                          %
                        </span>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="PO_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Purchase Order</FormLabel>
                      <Select
                        onValueChange={(value) => {
                          field.onChange(value);
                          if (value) {
                            form.setValue("CWO_id", undefined);
                          }
                        }}
                        value={field.value}
                        disabled={
                          isSubmitting ||
                          (!!form.watch("CWO_id") && !field.value)
                        }
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a purchase order" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="">None</SelectItem>
                          {purchaseOrders.map((po) => (
                            <SelectItem key={po.PO_id} value={po.PO_id}>
                              {po.contract?.job_title || po.PO_id}
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
                  name="CWO_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Call-off Work Order</FormLabel>
                      <Select
                        onValueChange={(value) => {
                          field.onChange(value);
                          if (value) {
                            form.setValue("PO_id", undefined);
                          }
                        }}
                        value={field.value}
                        disabled={
                          isSubmitting ||
                          (!!form.watch("PO_id") && !field.value)
                        }
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a work order" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="">None</SelectItem>
                          {calloffWorkOrders.map((cwo) => (
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

                {!orderTypeSelected && (
                  <div className="text-sm text-amber-600">
                    Please select either a Purchase Order or a Call-off Work
                    Order
                  </div>
                )}
              </div>

              <DialogFooter className="pt-4">
                <Button
                  variant="outline"
                  onClick={onClose}
                  disabled={isSubmitting}
                  type="button"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting || !orderTypeSelected}
                >
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
