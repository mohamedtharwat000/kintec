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
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  useBankDetail,
  useCreateBankDetail,
  useUpdateBankDetail,
} from "@/hooks/useBankDetail";
import { useContractors } from "@/hooks/useContractor";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { tryCatch } from "@/lib/utils";
import { BankDetailType } from "@/types/BankDetail";

const formSchema = z.object({
  contractor_id: z.string().min(1, "Contractor is required"),
  bank_name: z.string().min(1, "Bank name is required"),
  account_number: z.string().min(1, "Account number is required"),
  IBAN: z.string().min(1, "IBAN is required"),
  SWIFT: z.string().min(1, "SWIFT code is required"),
  currency: z.string().min(1, "Currency is required"),
  bank_detail_type: z.enum(["primary", "secondary"]).default("primary"),
  bank_detail_validated: z.boolean().default(false),
});

type FormData = z.infer<typeof formSchema>;

interface BankDetailFormProps {
  bankDetailId?: string;
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function BankDetailForm({
  bankDetailId,
  open,
  onClose,
  onSuccess,
}: BankDetailFormProps) {
  const isEditing = !!bankDetailId;
  const { data: existingBankDetail, isLoading: isLoadingBankDetail } =
    useBankDetail(bankDetailId || "");
  const { data: contractors = [] } = useContractors();
  const createBankDetail = useCreateBankDetail();
  const updateBankDetail = useUpdateBankDetail();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      contractor_id: "",
      bank_name: "",
      account_number: "",
      IBAN: "",
      SWIFT: "",
      currency: "",
      bank_detail_type: "primary",
      bank_detail_validated: false,
    },
  });

  useEffect(() => {
    if (isEditing && existingBankDetail) {
      form.reset({
        contractor_id: existingBankDetail.contractor_id,
        bank_name: existingBankDetail.bank_name,
        account_number: existingBankDetail.account_number,
        IBAN: existingBankDetail.IBAN,
        SWIFT: existingBankDetail.SWIFT,
        currency: existingBankDetail.currency,
        bank_detail_type: existingBankDetail.bank_detail_type,
        bank_detail_validated:
          existingBankDetail.bank_detail_validated || false,
      });
    } else if (!isEditing && open) {
      form.reset({
        contractor_id: "",
        bank_name: "",
        account_number: "",
        IBAN: "",
        SWIFT: "",
        currency: "",
        bank_detail_type: "primary",
        bank_detail_validated: false,
      });
    }
  }, [existingBankDetail, form, isEditing, open]);

  const onSubmit = async (data: FormData) => {
    const { error } = await tryCatch(async () => {
      if (isEditing) {
        await updateBankDetail.mutateAsync({
          id: bankDetailId!,
          data: {
            ...data,
            bank_detail_type: data.bank_detail_type as BankDetailType,
          },
        });
        toast.success("Bank detail updated successfully");
      } else {
        await createBankDetail.mutateAsync({
          ...data,
          last_updated: new Date(),
        });
        toast.success("Bank detail added successfully");
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
          ? "Failed to update bank detail"
          : "Failed to create bank detail"
      );
    }
  };

  const isSubmitting = createBankDetail.isPending || updateBankDetail.isPending;

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
            {isEditing ? "Edit Bank Detail" : "Add New Bank Detail"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Update the bank account information."
              : "Enter details for the bank account."}
          </DialogDescription>
        </DialogHeader>

        {isEditing && isLoadingBankDetail ? (
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
                      disabled={isEditing || isSubmitting}
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

              <FormField
                control={form.control}
                name="bank_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bank Name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter bank name"
                        {...field}
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
                  name="account_number"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Account Number</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter account number"
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
                  name="currency"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Currency</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="EUR, USD, GBP, etc."
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
                name="IBAN"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>IBAN</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter IBAN"
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
                name="SWIFT"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>SWIFT / BIC Code</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter SWIFT code"
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
                name="bank_detail_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Account Type</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      disabled={isSubmitting}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select account type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="primary">Primary</SelectItem>
                        <SelectItem value="secondary">Secondary</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="bank_detail_validated"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-3">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        disabled={isSubmitting}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Validated</FormLabel>
                      <p className="text-sm text-muted-foreground">
                        Mark this bank account as validated
                      </p>
                    </div>
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
