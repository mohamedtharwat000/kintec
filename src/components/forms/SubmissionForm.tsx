import React, { useEffect } from "react";
import { Save, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DatePicker } from "@/components/ui/date-picker";
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
  useSubmission,
  useCreateSubmission,
  useUpdateSubmission,
} from "@/hooks/useSubmissions";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { useContractors } from "@/hooks/useContractor";
import { usePurchaseOrders } from "@/hooks/usePurchaseOrders";
import { useCalloffWorkOrders } from "@/hooks/useCalloffWorkOrders";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

// Define the schema for the form
const formSchema = z.object({
  contractor_id: z.string().min(1, "Contractor is required"),
  order_type: z.enum(["PO", "CWO"]),
  order_id: z.string().min(1, "Order ID is required"),
  billing_period: z.date({ required_error: "Billing period is required" }),
  payment_currency: z.string().min(1, "Payment currency is required"),
  invoice_currency: z.string().min(1, "Invoice currency is required"),
  invoice_due_date: z.date({ required_error: "Invoice due date is required" }),
  wht_rate: z.number().optional(),
  wht_applicable: z.boolean().optional(),
  external_assignment: z.boolean().optional(),
});

type FormData = z.infer<typeof formSchema>;

interface SubmissionFormProps {
  submissionId?: string;
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function SubmissionForm({
  submissionId,
  open,
  onClose,
  onSuccess,
}: SubmissionFormProps) {
  const isEditing = !!submissionId;
  const { data: existingSubmission, isLoading: isLoadingSubmission } =
    useSubmission(submissionId || "");
  const createSubmission = useCreateSubmission();
  const updateSubmission = useUpdateSubmission();
  const { data: contractors = [] } = useContractors();
  const { data: purchaseOrders = [] } = usePurchaseOrders();
  const { data: calloffWorkOrders = [] } = useCalloffWorkOrders();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      contractor_id: "",
      order_type: "PO" as const,
      order_id: "",
      payment_currency: "",
      invoice_currency: "",
      wht_applicable: false,
      external_assignment: false,
    },
  });

  // Populate form when editing existing submission
  useEffect(() => {
    if (isEditing && existingSubmission) {
      const orderType = existingSubmission.PO_id ? "PO" : "CWO";
      const orderId =
        existingSubmission.PO_id || existingSubmission.CWO_id || "";

      form.reset({
        contractor_id: existingSubmission.contractor_id,
        order_type: orderType as "PO" | "CWO",
        order_id: orderId,
        billing_period: new Date(existingSubmission.billing_period),
        payment_currency: existingSubmission.payment_currency,
        invoice_currency: existingSubmission.invoice_currency,
        invoice_due_date: new Date(existingSubmission.invoice_due_date),
        wht_rate: existingSubmission.wht_rate,
        wht_applicable: existingSubmission.wht_applicable,
        external_assignment: existingSubmission.external_assignment,
      });
    }
  }, [existingSubmission, form, isEditing]);

  const onSubmit = async (data: FormData) => {
    try {
      const submissionData = {
        contractor_id: data.contractor_id,
        ...(data.order_type === "PO"
          ? { PO_id: data.order_id }
          : { CWO_id: data.order_id }),
        billing_period: data.billing_period.toISOString(),
        payment_currency: data.payment_currency,
        invoice_currency: data.invoice_currency,
        invoice_due_date: data.invoice_due_date.toISOString(),
        wht_rate: data.wht_rate,
        wht_applicable: data.wht_applicable,
        external_assignment: data.external_assignment,
      };

      if (isEditing) {
        await updateSubmission.mutateAsync({
          id: submissionId!,
          data: submissionData,
        });
        toast.success("Submission updated successfully");
      } else {
        await createSubmission.mutateAsync(submissionData);
        toast.success("Submission added successfully");
      }

      if (onSuccess) {
        onSuccess();
      }
      onClose();
    } catch (error) {
      console.error(error);
      toast.error(
        isEditing
          ? "Failed to update submission"
          : "Failed to create submission"
      );
    }
  };

  const isSubmitting = createSubmission.isPending || updateSubmission.isPending;
  const orderType = form.watch("order_type");

  // Filter orders based on selected type
  const filteredOrders =
    orderType === "PO" ? purchaseOrders : calloffWorkOrders;

  return (
    <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Edit Submission" : "Add New Submission"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Update the submission information."
              : "Enter details for the new submission."}
          </DialogDescription>
        </DialogHeader>

        {isEditing && isLoadingSubmission ? (
          <div className="flex justify-center items-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="contractor_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contractor</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      disabled={isSubmitting}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select contractor" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {contractors.map((contractor) => (
                          <SelectItem
                            key={contractor.contractor_id}
                            value={contractor.contractor_id}
                          >
                            {`${contractor.first_name} ${contractor.last_name}`}
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
                name="order_type"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel>Order Type</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="flex space-x-4"
                        disabled={isSubmitting}
                      >
                        <FormItem className="flex items-center space-x-2">
                          <FormControl>
                            <RadioGroupItem value="PO" />
                          </FormControl>
                          <FormLabel className="font-normal cursor-pointer">
                            Purchase Order
                          </FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-2">
                          <FormControl>
                            <RadioGroupItem value="CWO" />
                          </FormControl>
                          <FormLabel className="font-normal cursor-pointer">
                            Call-off Work Order
                          </FormLabel>
                        </FormItem>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="order_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Order ID</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      disabled={isSubmitting}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={`Select ${orderType}`} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {filteredOrders.map((order) => (
                          <SelectItem
                            key={
                              orderType === "PO"
                                ? (order as any).PO_id
                                : (order as any).CWO_id
                            }
                            value={
                              orderType === "PO"
                                ? (order as any).PO_id
                                : (order as any).CWO_id
                            }
                          >
                            {orderType === "PO"
                              ? (order as any).PO_id
                              : (order as any).CWO_id}
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
                name="billing_period"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Billing Period</FormLabel>
                    <DatePicker
                      date={field.value}
                      setDate={field.onChange}
                      disabled={isSubmitting}
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="payment_currency"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Payment Currency</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="USD"
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
                  name="invoice_currency"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Invoice Currency</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="USD"
                          {...field}
                          disabled={isSubmitting}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="invoice_due_date"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Invoice Due Date</FormLabel>
                    <DatePicker
                      date={field.value}
                      setDate={field.onChange}
                      disabled={isSubmitting}
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="wht_rate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>WHT Rate (%)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="0.00"
                        {...field}
                        onChange={(e) =>
                          field.onChange(parseFloat(e.target.value) || 0)
                        }
                        disabled={isSubmitting}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="wht_applicable"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                      <div className="space-y-0.5">
                        <FormLabel className="text-sm">
                          WHT Applicable
                        </FormLabel>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          disabled={isSubmitting}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="external_assignment"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                      <div className="space-y-0.5">
                        <FormLabel className="text-sm">
                          External Assignment
                        </FormLabel>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          disabled={isSubmitting}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>

              <DialogFooter>
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
