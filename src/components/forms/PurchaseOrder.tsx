import React, { useEffect } from "react";
import { Save, Loader2, CalendarIcon } from "lucide-react";
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
import {
  usePurchaseOrder,
  useCreatePurchaseOrder,
  useUpdatePurchaseOrder,
} from "@/hooks/usePurchaseOrders";
import { useContracts } from "@/hooks/useContracts";
import { PO_Status } from "@/types/PurchaseOrder";
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
  contract_id: z.string().min(1, "Contract is required"),
  PO_start_date: z.date({
    required_error: "Start date is required",
  }),
  PO_end_date: z.date({
    required_error: "End date is required",
  }),
  PO_total_value: z.coerce
    .number({
      required_error: "Total value is required",
      invalid_type_error: "Total value must be a number",
    })
    .min(0, "Total value must be a positive number"),
  PO_status: z.nativeEnum(PO_Status),
  kintec_email_for_remittance: z.string().email("Valid email is required"),
});

type FormData = z.infer<typeof formSchema>;

interface PurchaseOrderFormProps {
  poId?: string;
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function PurchaseOrderForm({
  poId,
  open,
  onClose,
  onSuccess,
}: PurchaseOrderFormProps) {
  const isEditing = !!poId;
  const { data: existingPO, isLoading: isLoadingPO } = usePurchaseOrder(
    poId || ""
  );

  const { data: contracts = [] } = useContracts();
  const createPurchaseOrder = useCreatePurchaseOrder();
  const updatePurchaseOrder = useUpdatePurchaseOrder();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      contract_id: "",
      PO_start_date: new Date(),
      PO_end_date: new Date(),
      PO_total_value: 0,
      PO_status: PO_Status.active,
      kintec_email_for_remittance: "",
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
    if (isEditing && existingPO) {
      form.reset({
        contract_id: existingPO.contract_id,
        PO_start_date: new Date(existingPO.PO_start_date),
        PO_end_date: new Date(existingPO.PO_end_date),
        PO_total_value: safelyGetNumber(existingPO.PO_total_value),
        PO_status: existingPO.PO_status as PO_Status,
        kintec_email_for_remittance: existingPO.kintec_email_for_remittance,
      });
    } else if (!isEditing && open) {
      form.reset({
        contract_id: "",
        PO_start_date: new Date(),
        PO_end_date: new Date(),
        PO_total_value: 0,
        PO_status: PO_Status.active,
        kintec_email_for_remittance: "",
      });
    }
  }, [existingPO, form, isEditing, open]);

  const onSubmit = async (data: FormData) => {
    const { error } = await tryCatch(async () => {
      if (isEditing) {
        await updatePurchaseOrder.mutateAsync({
          id: poId!,
          // @ts-ignore
          data: {
            ...data,
          },
        });
        toast.success("Purchase order updated successfully");
      } else {
        // @ts-ignore
        await createPurchaseOrder.mutateAsync({
          ...data,
        });
        toast.success("Purchase order added successfully");
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
          ? "Failed to update purchase order"
          : "Failed to create purchase order"
      );
    }
  };

  const isSubmitting =
    createPurchaseOrder.isPending || updatePurchaseOrder.isPending;

  // Find contracts without PO
  const availableContracts = contracts.filter(
    (contract) =>
      !contract.purchase_order ||
      contract.contract_id === existingPO?.contract_id
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
            {isEditing ? "Edit Purchase Order" : "Add New Purchase Order"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Update purchase order details."
              : "Enter details for the new purchase order."}
          </DialogDescription>
        </DialogHeader>

        {isEditing && isLoadingPO ? (
          <div className="flex justify-center items-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="contract_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contract</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      value={field.value}
                      disabled={isSubmitting || isEditing}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a contract" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {availableContracts.map((contract) => (
                          <SelectItem
                            key={contract.contract_id}
                            value={contract.contract_id}
                          >
                            {contract.job_title} ({contract.job_number})
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
                name="PO_start_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Start Date</FormLabel>
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

              <FormField
                control={form.control}
                name="PO_end_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>End Date</FormLabel>
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

              <FormField
                control={form.control}
                name="PO_total_value"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Total Value</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="0.00"
                        {...field}
                        onChange={(e) =>
                          field.onChange(parseFloat(e.target.value))
                        }
                        disabled={isSubmitting}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="PO_status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
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
                        {Object.values(PO_Status).map((status) => (
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
                name="kintec_email_for_remittance"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Remittance Email</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="Enter remittance email"
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
