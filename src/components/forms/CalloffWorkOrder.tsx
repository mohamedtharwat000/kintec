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
  useCalloffWorkOrder,
  useCreateCalloffWorkOrder,
  useUpdateCalloffWorkOrder,
} from "@/hooks/useCalloffWorkOrders";
import { useContracts } from "@/hooks/useContracts";
import { PO_Status } from "@/types/Orders";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

const formSchema = z.object({
  contract_id: z.string().min(1, "Contract is required"),
  CWO_start_date: z.date({
    required_error: "Start date is required",
  }),
  CWO_end_date: z.date({
    required_error: "End date is required",
  }),
  CWO_total_value: z.coerce
    .number({
      required_error: "Total value is required",
      invalid_type_error: "Total value must be a number",
    })
    .min(0, "Total value must be a positive number"),
  CWO_status: z.nativeEnum(PO_Status),
  kintec_email_for_remittance: z.string().email("Valid email is required"),
});

type FormData = z.infer<typeof formSchema>;

interface CalloffWorkOrderFormProps {
  cwoId?: string;
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function CalloffWorkOrderForm({
  cwoId,
  open,
  onClose,
  onSuccess,
}: CalloffWorkOrderFormProps) {
  const isEditing = !!cwoId;
  const { data: existingCWO, isLoading: isLoadingCWO } = useCalloffWorkOrder(
    cwoId || ""
  );

  const { data: contracts = [] } = useContracts();
  const createCalloffWorkOrder = useCreateCalloffWorkOrder();
  const updateCalloffWorkOrder = useUpdateCalloffWorkOrder();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      contract_id: "",
      CWO_start_date: new Date(),
      CWO_end_date: new Date(),
      CWO_total_value: 0,
      CWO_status: PO_Status.active,
      kintec_email_for_remittance: "",
    },
  });

  useEffect(() => {
    if (isEditing && existingCWO) {
      form.reset({
        contract_id: existingCWO.contract_id,
        CWO_start_date: new Date(existingCWO.CWO_start_date),
        CWO_end_date: new Date(existingCWO.CWO_end_date),
        CWO_total_value: existingCWO.CWO_total_value as unknown as number,
        CWO_status: existingCWO.CWO_status as PO_Status,
        kintec_email_for_remittance: existingCWO.kintec_email_for_remittance,
      });
    } else if (!isEditing && open) {
      // Reset form when opening in create mode
      form.reset({
        contract_id: "",
        CWO_start_date: new Date(),
        CWO_end_date: new Date(),
        CWO_total_value: 0,
        CWO_status: PO_Status.active,
        kintec_email_for_remittance: "",
      });
    }
  }, [existingCWO, form, isEditing, open]);

  const onSubmit = async (data: FormData) => {
    try {
      if (isEditing) {
        await updateCalloffWorkOrder.mutateAsync({
          id: cwoId!,
          data: {
            ...data,
          },
        });
        toast.success("Call-off work order updated successfully");
      } else {
        await createCalloffWorkOrder.mutateAsync({
          ...data,
        });
        toast.success("Call-off work order added successfully");
      }

      if (onSuccess) {
        onSuccess();
      }
      onClose();
    } catch (error) {
      console.error(error);
      toast.error(
        isEditing
          ? "Failed to update call-off work order"
          : "Failed to create call-off work order"
      );
    }
  };

  const isSubmitting =
    createCalloffWorkOrder.isPending || updateCalloffWorkOrder.isPending;

  // Find available contracts (let's allow multiple CWOs per contract)
  const availableContracts = contracts;

  return (
    <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {isEditing
              ? "Edit Call-off Work Order"
              : "Add New Call-off Work Order"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Update call-off work order details."
              : "Enter details for the new call-off work order."}
          </DialogDescription>
        </DialogHeader>

        {isEditing && isLoadingCWO ? (
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="CWO_start_date"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
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
                  name="CWO_end_date"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
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
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="CWO_total_value"
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
                  name="CWO_status"
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
              </div>

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
