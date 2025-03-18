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
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { tryCatch } from "@/lib/utils";
import { useContractors } from "@/hooks/useContractor";
import { usePurchaseOrders } from "@/hooks/usePurchaseOrders";
import { useCalloffWorkOrders } from "@/hooks/useCalloffWorkOrders";
import {
  useSubmission,
  useCreateSubmission,
  useUpdateSubmission,
} from "@/hooks/useSubmissions";

const formSchema = z
  .object({
    contractor_id: z.string().min(1, "Contractor is required"),
    PO_id: z.string().optional(),
    CWO_id: z.string().optional(),
    billing_period: z.date({
      required_error: "Billing period is required",
    }),
    payment_currency: z.string().min(1, "Payment currency is required"),
    invoice_currency: z.string().min(1, "Invoice currency is required"),
    invoice_due_date: z.date({
      required_error: "Invoice due date is required",
    }),
    wht_applicable: z.boolean().default(false),
    wht_rate: z.coerce.number().nullable().optional(),
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

  const { data: contractors = [] } = useContractors();
  const { data: purchaseOrders = [] } = usePurchaseOrders();
  const { data: calloffWorkOrders = [] } = useCalloffWorkOrders();
  const createSubmission = useCreateSubmission();
  const updateSubmission = useUpdateSubmission();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      contractor_id: "",
      PO_id: undefined,
      CWO_id: undefined,
      billing_period: new Date(),
      payment_currency: "",
      invoice_currency: "",
      invoice_due_date: new Date(),
      wht_applicable: false,
      wht_rate: null,
      external_assignment: false,
    },
  });

  useEffect(() => {
    if (isEditing && existingSubmission) {
      form.reset({
        contractor_id: existingSubmission.contractor_id,
        PO_id: existingSubmission.PO_id || undefined,
        CWO_id: existingSubmission.CWO_id || undefined,
        billing_period: new Date(existingSubmission.billing_period),
        payment_currency: existingSubmission.payment_currency,
        invoice_currency: existingSubmission.invoice_currency,
        invoice_due_date: new Date(existingSubmission.invoice_due_date),
        wht_applicable: existingSubmission.wht_applicable || false,
        wht_rate: existingSubmission.wht_rate || null,
        external_assignment: existingSubmission.external_assignment || false,
      });
    } else if (!isEditing && open) {
      // Reset form when opening in create mode
      form.reset({
        contractor_id: "",
        PO_id: undefined,
        CWO_id: undefined,
        billing_period: new Date(),
        payment_currency: "",
        invoice_currency: "",
        invoice_due_date: new Date(),
        wht_applicable: false,
        wht_rate: null,
        external_assignment: false,
      });
    }
  }, [existingSubmission, form, isEditing, open]);

  const onSubmit = async (data: FormData) => {
    const { error } = await tryCatch(async () => {
      if (isEditing) {
        await updateSubmission.mutateAsync({
          id: submissionId!,
          data: {
            ...data,
          },
        });
        toast.success("Submission updated successfully");
      } else {
        await createSubmission.mutateAsync({
          ...data,
          PO_id: data.PO_id || null,
          CWO_id: data.CWO_id || null,
          wht_rate: data.wht_rate || null,
          wht_applicable: data.wht_applicable || null,
          external_assignment: data.external_assignment || null,
        });
        toast.success("Submission added successfully");
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
          ? "Failed to update submission"
          : "Failed to create submission"
      );
    }
  };

  const isSubmitting = createSubmission.isPending || updateSubmission.isPending;

  // Watch values to conditionally render form elements
  const watchWhtApplicable = form.watch("wht_applicable");
  const watchPOId = form.watch("PO_id");
  const watchCWOId = form.watch("CWO_id");

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
            {isEditing ? "Edit Submission" : "Add New Submission"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Update submission details."
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
                      value={field.value}
                      disabled={isSubmitting || isEditing}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a contractor" />
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
                              {po.PO_id}{" "}
                              {po.contract?.job_title
                                ? `- ${po.contract.job_title}`
                                : ""}
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
                              {cwo.CWO_id}{" "}
                              {cwo.contract?.job_title
                                ? `- ${cwo.contract.job_title}`
                                : ""}
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

                <FormField
                  control={form.control}
                  name="invoice_due_date"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Invoice Due Date</FormLabel>
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
                  name="payment_currency"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Payment Currency</FormLabel>
                      <FormControl>
                        <Input placeholder="USD" {...field} />
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
                        <Input placeholder="USD" {...field} />
                      </FormControl>
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
