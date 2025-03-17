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
  useContractor,
  useCreateContractor,
  useUpdateContractor,
} from "@/hooks/useContractor";
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
  first_name: z.string().min(1, "First name is required"),
  middle_name: z.string().optional(),
  last_name: z.string().min(1, "Last name is required"),
  date_of_birth: z.string().min(1, "Date of birth is required"),
  email_address: z.string().email("Invalid email address"),
  phone_number: z.string().min(1, "Phone number is required"),
  nationality: z.string().min(1, "Nationality is required"),
  address: z.string().min(1, "Address is required"),
  country_of_residence: z.string().min(1, "Country of residence is required"),
});

type FormData = z.infer<typeof formSchema>;

interface ContractorFormProps {
  contractorId?: string;
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function ContractorForm({
  contractorId,
  open,
  onClose,
  onSuccess,
}: ContractorFormProps) {
  const isEditing = !!contractorId;
  const { data: existingContractor, isLoading: isLoadingContractor } =
    useContractor(contractorId || "");

  const createContractor = useCreateContractor();
  const updateContractor = useUpdateContractor();

  const isSubmitting = createContractor.isPending || updateContractor.isPending;

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      first_name: "",
      middle_name: "",
      last_name: "",
      date_of_birth: "",
      email_address: "",
      phone_number: "",
      nationality: "",
      address: "",
      country_of_residence: "",
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
    if (isEditing && existingContractor) {
      form.reset({
        first_name: existingContractor.first_name,
        middle_name: existingContractor.middle_name || "",
        last_name: existingContractor.last_name,
        date_of_birth: formatDate(existingContractor.date_of_birth),
        email_address: existingContractor.email_address,
        phone_number: existingContractor.phone_number,
        nationality: existingContractor.nationality,
        address: existingContractor.address,
        country_of_residence: existingContractor.country_of_residence,
      });
    } else if (!isEditing && open) {
      form.reset({
        first_name: "",
        middle_name: "",
        last_name: "",
        date_of_birth: "",
        email_address: "",
        phone_number: "",
        nationality: "",
        address: "",
        country_of_residence: "",
      });
    }
  }, [existingContractor, form, isEditing, open]);

  const onSubmit = async (data: FormData) => {
    const { error } = await tryCatch(async () => {
      if (isEditing) {
        await updateContractor.mutateAsync({
          id: contractorId!,
          data: {
            ...data,
            date_of_birth: new Date(data.date_of_birth),
          },
        });
        toast.success("Contractor updated successfully");
      } else {
        await createContractor.mutateAsync({
          ...data,
          middle_name: data.middle_name || null,
          date_of_birth: new Date(data.date_of_birth),
        });
        toast.success("Contractor added successfully");
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
          ? "Failed to update contractor"
          : "Failed to create contractor"
      );
    }
  };

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
            {isEditing ? "Edit Contractor" : "Add New Contractor"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Update contractor details."
              : "Enter details for the new contractor."}
          </DialogDescription>
        </DialogHeader>

        {isEditing && isLoadingContractor ? (
          <div className="flex justify-center items-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="first_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>First Name</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter first name"
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
                  name="middle_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Middle Name (Optional)</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter middle name"
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
                  name="last_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Last Name</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter last name"
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
                  name="date_of_birth"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Date of Birth</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} disabled={isSubmitting} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="email_address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email Address</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="email@example.com"
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
                  name="phone_number"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter phone number"
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
                  name="nationality"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nationality</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter nationality"
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
                  name="country_of_residence"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Country of Residence</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter country of residence"
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
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Address</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter full address"
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
