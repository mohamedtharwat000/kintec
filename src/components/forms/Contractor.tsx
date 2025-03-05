import React, { useEffect } from "react";
import { Save, X, Loader2 } from "lucide-react";
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
} from "@/hooks/useApp";
import { Contractor } from "@/types/Contractor";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CountryIdStatus, CountryIdType, VisaStatus } from "@/types/Contractor";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Define the schema for the contractor form
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

  // ID & Visa Details - optional
  visa_number: z.string().optional(),
  visa_type: z.string().optional(),
  visa_country: z.string().optional(),
  visa_expiry_date: z.string().optional(),
  visa_status: z.nativeEnum(VisaStatus).optional(),
  visa_sponsor: z.string().optional(),
  country_id_number: z.string().optional(),
  country_id_type: z.nativeEnum(CountryIdType).optional(),
  country_id_expiry_date: z.string().optional(),
  country_id_status: z.nativeEnum(CountryIdStatus).optional(),

  // Bank Details - optional
  bank_name: z.string().optional(),
  account_number: z.string().optional(),
  iban: z.string().optional(),
  swift: z.string().optional(),
  currency: z.string().optional(),
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

  const [activeTab, setActiveTab] = React.useState("personal");

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
      visa_number: "",
      visa_type: "",
      visa_country: "",
      visa_expiry_date: "",
      visa_status: undefined,
      visa_sponsor: "",
      country_id_number: "",
      country_id_type: undefined,
      country_id_expiry_date: "",
      country_id_status: undefined,
      bank_name: "",
      account_number: "",
      iban: "",
      swift: "",
      currency: "",
    },
  });

  // Helper function to safely format dates
  const formatDate = (dateValue: any): string => {
    if (!dateValue) return "";

    if (dateValue instanceof Date) {
      return dateValue.toISOString().split("T")[0];
    } else if (typeof dateValue === "string") {
      // If it's already a string, try to format it if it looks like a date
      if (dateValue.includes("T")) {
        return dateValue.split("T")[0];
      }
      return dateValue;
    }

    return "";
  };

  // Populate form when editing existing contractor
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

        visa_number: existingContractor.visa_details?.[0]?.visa_number || "",
        visa_type: existingContractor.visa_details?.[0]?.visa_type || "",
        visa_country: existingContractor.visa_details?.[0]?.visa_country || "",
        visa_expiry_date: formatDate(
          existingContractor.visa_details?.[0]?.visa_expiry_date
        ),
        visa_status:
          existingContractor.visa_details?.[0]?.visa_status || undefined,
        visa_sponsor: existingContractor.visa_details?.[0]?.visa_sponsor || "",
        country_id_number:
          existingContractor.visa_details?.[0]?.country_id_number || "",
        country_id_type:
          existingContractor.visa_details?.[0]?.country_id_type || undefined,
        country_id_expiry_date: formatDate(
          existingContractor.visa_details?.[0]?.country_id_expiry_date
        ),
        country_id_status:
          existingContractor.visa_details?.[0]?.country_id_status || undefined,

        bank_name: existingContractor.bank_details?.[0]?.bank_name || "",
        account_number:
          existingContractor.bank_details?.[0]?.account_number || "",
        iban: existingContractor.bank_details?.[0]?.IBAN || "",
        swift: existingContractor.bank_details?.[0]?.SWIFT || "",
        currency: existingContractor.bank_details?.[0]?.currency || "",
      });
    } else if (!isEditing && open) {
      // Reset form when opening in create mode
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
        visa_number: "",
        visa_type: "",
        visa_country: "",
        visa_expiry_date: "",
        visa_status: undefined,
        visa_sponsor: "",
        country_id_number: "",
        country_id_type: undefined,
        country_id_expiry_date: "",
        country_id_status: undefined,
        bank_name: "",
        account_number: "",
        iban: "",
        swift: "",
        currency: "",
      });
    }
  }, [existingContractor, form, isEditing, open]);

  const onSubmit = async (data: FormData) => {
    try {
      // Build contractor payload with nested bank and visa details if provided
      const contractorData: any = {
        first_name: data.first_name,
        middle_name: data.middle_name,
        last_name: data.last_name,
        date_of_birth: data.date_of_birth
          ? new Date(data.date_of_birth).toISOString()
          : undefined,
        email_address: data.email_address,
        phone_number: data.phone_number,
        nationality: data.nationality,
        address: data.address,
        country_of_residence: data.country_of_residence,
      };

      if (data.bank_name) {
        contractorData.bank_details = {
          bank_name: data.bank_name,
          account_number: data.account_number,
          IBAN: data.iban,
          SWIFT: data.swift,
          currency: data.currency,
          bank_detail_type: "primary", // default type
          bank_detail_validated: false, // default validated flag
        };
      }

      if (data.visa_number) {
        contractorData.visa_details = {
          visa_number: data.visa_number,
          visa_type: data.visa_type,
          visa_country: data.visa_country,
          visa_expiry_date: data.visa_expiry_date,
          visa_status: data.visa_status,
          visa_sponsor: data.visa_sponsor,
          country_id_number: data.country_id_number,
          country_id_type: data.country_id_type,
          country_id_expiry_date: data.country_id_expiry_date,
          country_id_status: data.country_id_status,
        };
      }

      if (isEditing) {
        await updateContractor.mutateAsync({
          id: contractorId!,
          data: contractorData,
        });
        toast.success("Contractor updated successfully");
      } else {
        await createContractor.mutateAsync(contractorData);
        toast.success("Contractor added successfully");
      }

      if (onSuccess) {
        onSuccess();
      }
      onClose();
    } catch (error) {
      console.error(error);
      toast.error(
        isEditing
          ? "Failed to update contractor"
          : "Failed to create contractor"
      );
    }
  };

  const isSubmitting = createContractor.isPending || updateContractor.isPending;

  return (
    <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
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
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <Tabs
                defaultValue="personal"
                value={activeTab}
                onValueChange={setActiveTab}
                className="w-full"
              >
                <TabsList className="grid grid-cols-3 w-full mb-4">
                  <TabsTrigger value="personal">Personal Details</TabsTrigger>
                  <TabsTrigger value="identification">ID & Visa</TabsTrigger>
                  <TabsTrigger value="bank">Bank Details</TabsTrigger>
                </TabsList>

                <TabsContent value="personal">
                  <div className="grid grid-cols-1 gap-y-6 sm:grid-cols-2 gap-x-4">
                    <FormField
                      control={form.control}
                      name="date_of_birth"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Date of Birth</FormLabel>
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

                    <div className="sm:col-span-2">
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
                    </div>

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
                </TabsContent>

                <TabsContent value="identification">
                  <div className="grid grid-cols-1 gap-y-6 sm:grid-cols-2 gap-x-4">
                    <FormField
                      control={form.control}
                      name="visa_number"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Visa Number (Optional)</FormLabel>
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
                          <FormLabel>Visa Type (Optional)</FormLabel>
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
                          <FormLabel>Visa Country (Optional)</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Enter visa country"
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
                          <FormLabel>Visa Expiry Date (Optional)</FormLabel>
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
                      name="visa_status"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Visa Status (Optional)</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a status" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {Object.values(VisaStatus).map((status) => (
                                <SelectItem key={status} value={status}>
                                  {status}
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

                    <FormField
                      control={form.control}
                      name="country_id_number"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Country ID Number (Optional)</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Enter country ID number"
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
                      name="country_id_type"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Country ID Type (Optional)</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select ID type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {Object.values(CountryIdType).map((type) => (
                                <SelectItem key={type} value={type}>
                                  {type}
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
                      name="country_id_expiry_date"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            Country ID Expiry Date (Optional)
                          </FormLabel>
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
                          <FormLabel>Country ID Status (Optional)</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select ID status" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {Object.values(CountryIdStatus).map((status) => (
                                <SelectItem key={status} value={status}>
                                  {status}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </TabsContent>

                <TabsContent value="bank">
                  <div className="grid grid-cols-1 gap-y-6 sm:grid-cols-2 gap-x-4">
                    <FormField
                      control={form.control}
                      name="bank_name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Bank Name (Optional)</FormLabel>
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

                    <FormField
                      control={form.control}
                      name="account_number"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Account Number (Optional)</FormLabel>
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
                      name="iban"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>IBAN (Optional)</FormLabel>
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
                      name="swift"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>SWIFT (Optional)</FormLabel>
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
                      name="currency"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Currency (Optional)</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Enter currency"
                              {...field}
                              disabled={isSubmitting}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </TabsContent>
              </Tabs>

              <DialogFooter className="pt-4 mt-4 border-t">
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
