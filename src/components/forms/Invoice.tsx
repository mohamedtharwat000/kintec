import React, { useEffect } from "react";
import { Save, X, Loader2, CalendarIcon } from "lucide-react";
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
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { InvoiceStatus, InvoiceType } from "@/types/Invoice";
import {
  useInvoice,
  useCreateInvoice,
  useUpdateInvoice,
} from "@/hooks/useInvoices";
import { usePurchaseOrders } from "@/hooks/usePurchaseOrders";
import { useCalloffWorkOrders } from "@/hooks/useCalloffWorkOrders";

// You may need to create these hooks if they don't exist yet

const formSchema = z
  .object({
    billing_period: z.date({
      required_error: "Billing period is required",
    }),
    invoice_status: z.nativeEnum(InvoiceStatus),
    invoice_type: z.nativeEnum(InvoiceType),
    invoice_currency: z.string().min(1, "Currency is required"),
    invoice_total_value: z.coerce
      .number()
      .positive("Total value must be positive"),
    PO_id: z.string().optional(),
    CWO_id: z.string().optional(),
    wht_rate: z.coerce.number().nullable().optional(),
    wht_applicable: z.boolean().default(false),
    external_assignment: z.boolean().default(false),
  })
  .refine(
    (data) => {
      // Either PO_id or CWO_id should be provided, but not both
      return (!!data.PO_id && !data.CWO_id) || (!data.PO_id && !!data.CWO_id);
    },
    {
      message:
        "Either a Purchase Order or Call-off Work Order must be selected",
      path: ["PO_id"],
    }
  );

type FormData = z.infer<typeof formSchema>;

interface InvoiceFormProps {
  invoiceId?: string;
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function InvoiceForm({
  invoiceId,
  open,
  onClose,
  onSuccess,
}: InvoiceFormProps) {
  const isEditing = !!invoiceId;
  const { data: existingInvoice, isLoading: isLoadingInvoice } = useInvoice(
    invoiceId || ""
  );

  const { data: purchaseOrders = [] } = usePurchaseOrders();
  const { data: calloffWorkOrders = [] } = useCalloffWorkOrders();

  const createInvoice = useCreateInvoice();
  const updateInvoice = useUpdateInvoice();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      billing_period: new Date(),
      invoice_status: InvoiceStatus.pending,
      invoice_type: InvoiceType.sales,
      invoice_currency: "",
      invoice_total_value: undefined,
      PO_id: undefined,
      CWO_id: undefined,
      wht_rate: null,
      wht_applicable: false,
      external_assignment: false,
    },
  });

  useEffect(() => {
    if (isEditing && existingInvoice) {
      form.reset({
        billing_period: new Date(existingInvoice.billing_period),
        invoice_status: existingInvoice.invoice_status,
        invoice_type: existingInvoice.invoice_type,
        invoice_currency: existingInvoice.invoice_currency,
        invoice_total_value: parseFloat(
          existingInvoice.invoice_total_value.toString()
        ),
        PO_id: existingInvoice.PO_id || undefined,
        CWO_id: existingInvoice.CWO_id || undefined,
        wht_rate: existingInvoice.wht_rate || null,
        wht_applicable: existingInvoice.wht_applicable || false,
        external_assignment: existingInvoice.external_assignment || false,
      });
    } else if (!isEditing && open) {
      // Reset form when opening in create mode
      form.reset({
        billing_period: new Date(),
        invoice_status: InvoiceStatus.pending,
        invoice_type: InvoiceType.sales,
        invoice_currency: "",
        invoice_total_value: undefined,
        PO_id: undefined,
        CWO_id: undefined,
        wht_rate: null,
        wht_applicable: false,
        external_assignment: false,
      });
    }
  }, [existingInvoice, form, isEditing, open]);

  const onSubmit = async (data: FormData) => {
    try {
      if (isEditing) {
        await updateInvoice.mutateAsync({
          id: invoiceId,
          data: {
            ...data,
            billing_period: new Date(data.billing_period.toISOString()),
            wht_rate: data.wht_rate === null ? undefined : data.wht_rate,
          },
        });
        toast.success("Invoice updated successfully");
      } else {
        await createInvoice.mutateAsync({
          ...data,
          billing_period: new Date(data.billing_period),
          wht_rate: data.wht_rate === null ? undefined : data.wht_rate,
        });
        toast.success("Invoice added successfully");
      }

      if (onSuccess) {
        onSuccess();
      }
      onClose();
    } catch (error) {
      console.error(error);
      toast.error(
        isEditing ? "Failed to update invoice" : "Failed to create invoice"
      );
    }
  };

  const isSubmitting = createInvoice.isPending || updateInvoice.isPending;

  // Watch values to conditionally render form elements
  const watchWhtApplicable = form.watch("wht_applicable");
  const watchPOId = form.watch("PO_id");
  const watchCWOId = form.watch("CWO_id");

  return (
    <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Edit Invoice" : "Add New Invoice"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Update invoice details."
              : "Enter details for the new invoice."}
          </DialogDescription>
        </DialogHeader>

        {isEditing && isLoadingInvoice ? (
          <div className="flex justify-center items-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="billing_period"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Billing Period</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className="w-full pl-3 text-left font-normal"
                            disabled={isSubmitting}
                          >
                            {field.value ? (
                              format(field.value, "PPP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="invoice_status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Invoice Status</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        value={field.value}
                        disabled={isSubmitting}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {Object.values(InvoiceStatus).map((status) => (
                            <SelectItem key={status} value={status}>
                              {status.charAt(0).toUpperCase() + status.slice(1)}
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
                  name="invoice_type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Invoice Type</FormLabel>
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
                          {Object.values(InvoiceType).map((type) => (
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
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="invoice_currency"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Currency</FormLabel>
                      <FormControl>
                        <Input placeholder="USD" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="invoice_total_value"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Total Value</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="PO_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Purchase Order</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value || ""}
                        disabled={isSubmitting || !!watchCWOId}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select PO" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="">None</SelectItem>
                          {purchaseOrders.map((po) => (
                            <SelectItem key={po.PO_id} value={po.PO_id}>
                              {po.PO_id}
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
                        onValueChange={field.onChange}
                        value={field.value || ""}
                        disabled={isSubmitting || !!watchPOId}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select CWO" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="">None</SelectItem>
                          {calloffWorkOrders.map((cwo) => (
                            <SelectItem key={cwo.CWO_id} value={cwo.CWO_id}>
                              {cwo.CWO_id}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="wht_applicable"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          disabled={isSubmitting}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Withholding Tax Applicable</FormLabel>
                      </div>
                    </FormItem>
                  )}
                />

                {watchWhtApplicable && (
                  <FormField
                    control={form.control}
                    name="wht_rate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>WHT Rate (%)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.01"
                            placeholder="0.00"
                            {...field}
                            value={field.value || ""}
                            onChange={(e) => {
                              const value = e.target.value;
                              field.onChange(
                                value === "" ? null : parseFloat(value)
                              );
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                <FormField
                  control={form.control}
                  name="external_assignment"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          disabled={isSubmitting}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>External Assignment</FormLabel>
                      </div>
                    </FormItem>
                  )}
                />
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
