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
import { useRate, useCreateRate, useUpdateRate } from "@/hooks/useRates";
import { usePurchaseOrders } from "@/hooks/usePurchaseOrders";
import { useCalloffWorkOrders } from "@/hooks/useCalloffWorkOrders";
import { RateType, RateFrequency } from "@/types/Rate";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

// Schema for form validation
const formSchema = z.object({
  rate_type: z.nativeEnum(RateType, {
    required_error: "Rate type is required",
  }),
  rate_frequency: z.nativeEnum(RateFrequency, {
    required_error: "Rate frequency is required",
  }),
  rate_value: z
    .string()
    .min(1, "Rate value is required")
    .refine((val) => !isNaN(Number(val)), "Value must be a number"),
  rate_currency: z.string().min(1, "Currency is required"),
  orderReference: z.object({
    type: z.enum(["PO", "CWO"]),
    id: z.string().min(1, "Reference ID is required"),
  }),
});

type FormData = z.infer<typeof formSchema>;

interface RateFormProps {
  rateId?: string;
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function RateForm({ rateId, open, onClose, onSuccess }: RateFormProps) {
  const isEditing = !!rateId;
  const { data: existingRate, isLoading: isLoadingRate } = useRate(
    rateId || ""
  );

  const { data: purchaseOrders = [] } = usePurchaseOrders();
  const { data: calloffWorkOrders = [] } = useCalloffWorkOrders();

  const createRate = useCreateRate();
  const updateRate = useUpdateRate();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      rate_type: RateType.charged,
      rate_frequency: RateFrequency.hourly,
      rate_value: "",
      rate_currency: "USD",
      orderReference: {
        type: "PO",
        id: "",
      },
    },
  });

  // Populate form with existing rate data
  useEffect(() => {
    if (isEditing && existingRate) {
      form.reset({
        rate_type: existingRate.rate_type,
        rate_frequency: existingRate.rate_frequency,
        rate_value: existingRate.rate_value.toString(),
        rate_currency: existingRate.rate_currency,
        orderReference: {
          type: existingRate.PO_id ? "PO" : "CWO",
          id: existingRate.PO_id || existingRate.CWO_id || "",
        },
      });
    } else if (!isEditing && open) {
      // Reset form when opening in create mode
      form.reset({
        rate_type: RateType.charged,
        rate_frequency: RateFrequency.hourly,
        rate_value: "",
        rate_currency: "USD",
        orderReference: {
          type: "PO",
          id: "",
        },
      });
    }
  }, [existingRate, form, isEditing, open]);

  // Handle form submission
  const onSubmit = async (data: FormData) => {
    try {
      const payload = {
        rate_type: data.rate_type,
        rate_frequency: data.rate_frequency,
        rate_value: parseFloat(data.rate_value),
        rate_currency: data.rate_currency,
        PO_id:
          data.orderReference.type === "PO"
            ? data.orderReference.id
            : undefined,
        CWO_id:
          data.orderReference.type === "CWO"
            ? data.orderReference.id
            : undefined,
      };

      if (isEditing) {
        await updateRate.mutateAsync({
          id: rateId,
          data: payload,
        });
        toast.success("Rate updated successfully");
      } else {
        await createRate.mutateAsync(payload);
        toast.success("Rate added successfully");
      }

      if (onSuccess) {
        onSuccess();
      }
      onClose();
    } catch (error) {
      console.error(error);
      toast.error(
        isEditing ? "Failed to update rate" : "Failed to create rate"
      );
    }
  };

  const isSubmitting = createRate.isPending || updateRate.isPending;
  const referenceType = form.watch("orderReference.type");

  // List of common currencies
  const currencies = [
    "USD",
    "EUR",
    "GBP",
    "JPY",
    "CAD",
    "AUD",
    "CHF",
    "CNY",
    "HKD",
    "SGD",
    "SEK",
    "KRW",
    "NOK",
    "NZD",
    "INR",
    "MXN",
    "TWD",
    "ZAR",
  ];

  return (
    <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Rate" : "Add New Rate"}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Update rate details."
              : "Enter details for the new rate."}
          </DialogDescription>
        </DialogHeader>

        {isEditing && isLoadingRate ? (
          <div className="flex justify-center items-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="rate_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Rate Type</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      value={field.value}
                      disabled={isSubmitting}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select rate type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value={RateType.charged}>
                          Charged (to client)
                        </SelectItem>
                        <SelectItem value={RateType.paid}>
                          Paid (to contractor)
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="rate_frequency"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Rate Frequency</FormLabel>
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
                          <SelectItem value={RateFrequency.hourly}>
                            Hourly
                          </SelectItem>
                          <SelectItem value={RateFrequency.daily}>
                            Daily
                          </SelectItem>
                          <SelectItem value={RateFrequency.monthly}>
                            Monthly
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="rate_currency"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Currency</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        value={field.value}
                        disabled={isSubmitting}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select currency" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {currencies.map((currency) => (
                            <SelectItem key={currency} value={currency}>
                              {currency}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="rate_value"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Rate Value</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="e.g., 50.00"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Order Reference Selection */}
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="orderReference.type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Reference Type</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        value={field.value}
                        disabled={isSubmitting || isEditing} // Cannot change reference type in edit mode
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select reference type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="PO">Purchase Order</SelectItem>
                          <SelectItem value="CWO">
                            Call-off Work Order
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="orderReference.id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        {referenceType === "PO"
                          ? "Purchase Order"
                          : "Call-off Work Order"}
                      </FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        value={field.value}
                        disabled={isSubmitting}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue
                              placeholder={`Select ${
                                referenceType === "PO" ? "PO" : "CWO"
                              }`}
                            />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {referenceType === "PO"
                            ? purchaseOrders.map((po) => (
                                <SelectItem key={po.PO_id} value={po.PO_id}>
                                  {po.PO_id}
                                </SelectItem>
                              ))
                            : calloffWorkOrders.map((cwo) => (
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
