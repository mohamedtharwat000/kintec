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
  useVisaDetail,
  useCreateVisaDetail,
  useUpdateVisaDetail,
} from "@/hooks/useVisaDetail";
import { useContractors } from "@/hooks/useContractor";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { tryCatch } from "@/lib/utils";
import {
  VisaStatus,
  CountryIdType,
  CountryIdStatus,
  VisaDetail,
} from "@/types/VisaDetail";

const formSchema = z.object({
  contractor_id: z.string().min(1, "Contractor is required"),
  visa_number: z.string().min(1, "Visa number is required"),
  visa_type: z.string().min(1, "Visa type is required"),
  visa_country: z.string().min(1, "Country is required"),
  visa_expiry_date: z.string().min(1, "Expiry date is required"),
  visa_status: z.enum(["active", "revoked", "expired"]).default("active"),
  visa_sponsor: z.string().optional(),
  country_id_number: z.string().min(1, "ID number is required"),
  country_id_type: z
    .enum(["national_id", "passport", "other"])
    .default("passport"),
  country_id_expiry_date: z.string().min(1, "ID expiry date is required"),
  country_id_status: z.enum(["active", "revoked", "expired"]).default("active"),
});

type FormData = z.infer<typeof formSchema>;

interface VisaDetailFormProps {
  visaDetailId?: string;
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function VisaDetailForm({
  visaDetailId,
  open,
  onClose,
  onSuccess,
}: VisaDetailFormProps) {
  const isEditing = !!visaDetailId;
  const { data: existingVisaDetail, isLoading: isLoadingVisaDetail } =
    useVisaDetail(visaDetailId || "");
  const { data: contractors = [] } = useContractors();
  const createVisaDetail = useCreateVisaDetail();
  const updateVisaDetail = useUpdateVisaDetail();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      contractor_id: "",
      visa_number: "",
      visa_type: "",
      visa_country: "",
      visa_expiry_date: "",
      visa_status: "active",
      visa_sponsor: "",
      country_id_number: "",
      country_id_type: "passport",
      country_id_expiry_date: "",
      country_id_status: "active",
    },
  });

  const formatDate = (dateValue: string | Date): string => {
    if (!dateValue) return "";

    if (dateValue instanceof Date) {
      return dateValue.toISOString().split("T")[0];
    } else if (typeof dateValue === "string") {
      if (dateValue.includes("T")) {
        return dateValue.split("T")[0];
      }
      return dateValue;
    }

    return "";
  };

  useEffect(() => {
    if (isEditing && existingVisaDetail) {
      form.reset({
        contractor_id: existingVisaDetail.contractor_id,
        visa_number: existingVisaDetail.visa_number,
        visa_type: existingVisaDetail.visa_type,
        visa_country: existingVisaDetail.visa_country,
        visa_expiry_date: formatDate(existingVisaDetail.visa_expiry_date),
        visa_status: existingVisaDetail.visa_status,
        visa_sponsor: existingVisaDetail.visa_sponsor || "",
        country_id_number: existingVisaDetail.country_id_number,
        country_id_type: existingVisaDetail.country_id_type,
        country_id_expiry_date: formatDate(
          existingVisaDetail.country_id_expiry_date
        ),
        country_id_status: existingVisaDetail.country_id_status,
      });
    } else if (!isEditing && open) {
      form.reset({
        contractor_id: "",
        visa_number: "",
        visa_type: "",
        visa_country: "",
        visa_expiry_date: "",
        visa_status: "active",
        visa_sponsor: "",
        country_id_number: "",
        country_id_type: "passport",
        country_id_expiry_date: "",
        country_id_status: "active",
      });
    }
  }, [existingVisaDetail, form, isEditing, open]);

  const onSubmit = async (data: FormData) => {
    const { error } = await tryCatch(async () => {
      const formattedData: Partial<VisaDetail> = {
        ...data,
        visa_status: data.visa_status as VisaStatus,
        country_id_status: data.country_id_status as CountryIdStatus,
        country_id_type: data.country_id_type as CountryIdType,
      };
      if (isEditing) {
        await updateVisaDetail.mutateAsync({
          id: visaDetailId!,
          data: formattedData,
        });
        toast.success("Visa detail updated successfully");
      } else {
        await createVisaDetail.mutateAsync(formattedData);
        toast.success("Visa detail added successfully");
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
          ? "Failed to update visa detail"
          : "Failed to create visa detail"
      );
    }
  };

  const isSubmitting = createVisaDetail.isPending || updateVisaDetail.isPending;

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
            {isEditing ? "Edit Visa Detail" : "Add New Visa Detail"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Update visa and ID details."
              : "Enter visa and ID details for the contractor."}
          </DialogDescription>
        </DialogHeader>

        {isEditing && isLoadingVisaDetail ? (
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="visa_number"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Visa Number</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter visa number"
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
                  name="visa_type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Visa Type</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter visa type"
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
                  name="visa_country"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Country</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter country"
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
                  name="visa_expiry_date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Visa Expiry Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} disabled={isSubmitting} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="visa_status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Visa Status</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        disabled={isSubmitting}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select visa status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {Object.values(VisaStatus).map((status) => (
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
                  name="visa_sponsor"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Visa Sponsor (Optional)</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter visa sponsor"
                          {...field}
                          disabled={isSubmitting}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="border-t pt-4 mt-4">
                <h3 className="text-lg font-medium mb-4">Country ID Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="country_id_type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>ID Type</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          disabled={isSubmitting}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select ID type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {Object.values(CountryIdType).map((type) => (
                              <SelectItem key={type} value={type}>
                                {type
                                  .replace("_", " ")
                                  .split(" ")
                                  .map(
                                    (word) =>
                                      word.charAt(0).toUpperCase() +
                                      word.slice(1)
                                  )
                                  .join(" ")}
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
                    name="country_id_number"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>ID Number</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Enter ID number"
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
                    name="country_id_expiry_date"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>ID Expiry Date</FormLabel>
                        <FormControl>
                          <Input
                            type="date"
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
                    name="country_id_status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>ID Status</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          disabled={isSubmitting}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select ID status" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {Object.values(CountryIdStatus).map((status) => (
                              <SelectItem key={status} value={status}>
                                {status.charAt(0).toUpperCase() +
                                  status.slice(1)}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
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
