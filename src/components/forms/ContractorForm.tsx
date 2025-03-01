import React, { useEffect } from "react";
import { Save, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  useContractor,
  useCreateContractor,
  useUpdateContractor,
} from "@/hooks/useApp";
import { Contractor } from "@/types/contractor";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CountryIdStatus, CountryIdType, VisaStatus } from "@/types/contractor";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Define the schema for the basic contractor form
const formSchema = z.object({
  contractor_id: z.string().min(1, "Contractor ID is required"),
  first_name: z.string().min(1, "First name is required"),
  middle_name: z.string().optional(),
  last_name: z.string().min(1, "Last name is required"),
  date_of_birth: z.string().min(1, "Date of birth is required"),
  email_address: z.string().email("Invalid email address"),
  phone_number: z.string().min(1, "Phone number is required"),
  nationality: z.string().min(1, "Nationality is required"),
  address: z.string().min(1, "Address is required"),
  country_of_residence: z.string().min(1, "Country of residence is required"),

  // ID & Visa Details
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

  // Job Details
  job_title: z.string().optional(),
  department: z.string().optional(),
  start_date: z.string().optional(),
  end_date: z.string().optional(),
  salary: z.string().optional(),

  // Bank Details
  bank_name: z.string().optional(),
  account_number: z.string().optional(),
  iban: z.string().optional(),
  swift: z.string().optional(),
  currency: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

interface ContractorFormProps {
  contractorId?: string;
  onCancel: () => void;
  onSuccess?: () => void;
}

export function ContractorForm({
  contractorId,
  onCancel,
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
      contractor_id: "",
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

      job_title: "",
      department: "",
      start_date: "",
      end_date: "",
      salary: "",

      bank_name: "",
      account_number: "",
      iban: "",
      swift: "",
      currency: "",
    },
  });

  // Populate form when editing existing contractor
  useEffect(() => {
    if (isEditing && existingContractor) {
      form.reset({
        contractor_id: existingContractor.contractor_id,
        first_name: existingContractor.first_name,
        middle_name: existingContractor.middle_name || "",
        last_name: existingContractor.last_name,
        date_of_birth:
          existingContractor.date_of_birth instanceof Date
            ? existingContractor.date_of_birth.toISOString().split("T")[0]
            : "",
        email_address: existingContractor.email_address,
        phone_number: existingContractor.phone_number,
        nationality: existingContractor.nationality,
        address: existingContractor.address,
        country_of_residence: existingContractor.country_of_residence,

        visa_number: existingContractor.visa_details?.[0]?.visa_number || "",
        visa_type: existingContractor.visa_details?.[0]?.visa_type || "",
        visa_country: existingContractor.visa_details?.[0]?.visa_country || "",
        visa_expiry_date:
          existingContractor.visa_details?.[0]?.visa_expiry_date
            ?.toISOString()
            .split("T")[0] || "",
        visa_status:
          existingContractor.visa_details?.[0]?.visa_status || undefined,
        visa_sponsor: existingContractor.visa_details?.[0]?.visa_sponsor || "",
        country_id_number:
          existingContractor.visa_details?.[0]?.country_id_number || "",
        country_id_type:
          existingContractor.visa_details?.[0]?.country_id_type || undefined,
        country_id_expiry_date:
          existingContractor.visa_details?.[0]?.country_id_expiry_date
            ?.toISOString()
            .split("T")[0] || "",
        country_id_status:
          existingContractor.visa_details?.[0]?.country_id_status || undefined,

        job_title: existingContractor.contracts?.[0]?.job_title || "",
        department: "",
        start_date: "",
        end_date: "",
        salary: "",

        bank_name: existingContractor.bank_details?.[0]?.bank_name || "",
        account_number:
          existingContractor.bank_details?.[0]?.account_number || "",
        iban: existingContractor.bank_details?.[0]?.IBAN || "",
        swift: existingContractor.bank_details?.[0]?.SWIFT || "",
        currency: existingContractor.bank_details?.[0]?.currency || "",
      });
    }
  }, [existingContractor, form, isEditing]);

  const onSubmit = async (data: FormData) => {
    try {
      // Convert string date to Date object
      const formattedData = {
        ...data,
        date_of_birth: new Date(data.date_of_birth),
      };

      if (isEditing) {
        await updateContractor.mutateAsync({
          id: contractorId!,
          data: formattedData,
        });
        toast.success("Contractor updated successfully");
      } else {
        await createContractor.mutateAsync(
          formattedData as Omit<Contractor, "id">
        );
        toast.success("Contractor added successfully");
      }

      if (onSuccess) {
        onSuccess();
      }
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

  if (isEditing && isLoadingContractor) {
    return (
      <div className="flex justify-center items-center min-h-[300px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-semibold">
              {isEditing ? "Edit Contractor" : "Add New Contractor"}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {isEditing
                ? "Update the contractor details below"
                : "Complete the required details to add a new contractor."}
            </p>
          </div>
          <div className="flex space-x-3">
            <Button variant="ghost" onClick={onCancel} disabled={isSubmitting}>
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button
              onClick={form.handleSubmit(onSubmit)}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              {isEditing ? "Update" : "Save"}
            </Button>
          </div>
        </div>

        <Card className="mt-6">
          <Tabs
            defaultValue="personal"
            value={activeTab}
            onValueChange={setActiveTab}
          >
            <TabsList className="grid grid-cols-4 lg:grid-cols-8 max-w-full overflow-x-auto">
              <TabsTrigger value="personal">Personal Details</TabsTrigger>
              <TabsTrigger value="identification">ID & Visa</TabsTrigger>
              <TabsTrigger value="job">Job Details</TabsTrigger>
              <TabsTrigger value="bank">Bank Details</TabsTrigger>
            </TabsList>

            <CardContent className="pt-6">
              <Form {...form}>
                <PersonalDetailsTab
                  form={form}
                  isEditing={isEditing}
                  isSubmitting={isSubmitting}
                />
                <IDAndVisaTab
                  form={form}
                  isEditing={isEditing}
                  isSubmitting={isSubmitting}
                />
                <JobDetailsTab
                  form={form}
                  isEditing={isEditing}
                  isSubmitting={isSubmitting}
                />
                <BankDetailsTab
                  form={form}
                  isEditing={isEditing}
                  isSubmitting={isSubmitting}
                />
              </Form>
            </CardContent>
          </Tabs>
        </Card>
      </div>
    </div>
  );
}

interface PersonalDetailsTabProps {
  form: any;
  isEditing: boolean;
  isSubmitting: boolean;
}

function PersonalDetailsTab({
  form,
  isEditing,
  isSubmitting,
}: PersonalDetailsTabProps) {
  return (
    <TabsContent value="personal">
      <form className="grid grid-cols-1 gap-y-6 sm:grid-cols-2 gap-x-4">
        <FormField
          control={form.control}
          name="contractor_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Contractor ID</FormLabel>
              <FormControl>
                <Input
                  placeholder="e.g., CON001"
                  {...field}
                  disabled={isEditing || isSubmitting}
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
      </form>
    </TabsContent>
  );
}

interface IDAndVisaTabProps {
  form: any;
  isEditing: boolean;
  isSubmitting: boolean;
}

function IDAndVisaTab({ form, isEditing, isSubmitting }: IDAndVisaTabProps) {
  return (
    <TabsContent value="identification">
      <form className="grid grid-cols-1 gap-y-6 sm:grid-cols-2 gap-x-4">
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
              <FormLabel>Visa Country</FormLabel>
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
              <Select onValueChange={field.onChange} defaultValue={field.value}>
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
              <FormLabel>Visa Sponsor</FormLabel>
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
              <FormLabel>Country ID Number</FormLabel>
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
              <FormLabel>Country ID Type</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
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
              <FormLabel>Country ID Expiry Date</FormLabel>
              <FormControl>
                <Input type="date" {...field} disabled={isSubmitting} />
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
              <FormLabel>Country ID Status</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
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
      </form>
    </TabsContent>
  );
}

interface JobDetailsTabProps {
  form: any;
  isEditing: boolean;
  isSubmitting: boolean;
}

function JobDetailsTab({ form, isEditing, isSubmitting }: JobDetailsTabProps) {
  return (
    <TabsContent value="job">
      <form className="grid grid-cols-1 gap-y-6 sm:grid-cols-2 gap-x-4">
        <FormField
          control={form.control}
          name="job_title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Job Title</FormLabel>
              <FormControl>
                <Input
                  placeholder="Enter job title"
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
          name="department"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Department</FormLabel>
              <FormControl>
                <Input
                  placeholder="Enter department"
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
          name="start_date"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Start Date</FormLabel>
              <FormControl>
                <Input type="date" {...field} disabled={isSubmitting} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="end_date"
          render={({ field }) => (
            <FormItem>
              <FormLabel>End Date</FormLabel>
              <FormControl>
                <Input type="date" {...field} disabled={isSubmitting} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="salary"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Salary</FormLabel>
              <FormControl>
                <Input
                  placeholder="Enter salary"
                  {...field}
                  disabled={isSubmitting}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </form>
    </TabsContent>
  );
}

interface BankDetailsTabProps {
  form: any;
  isEditing: boolean;
  isSubmitting: boolean;
}

function BankDetailsTab({
  form,
  isEditing,
  isSubmitting,
}: BankDetailsTabProps) {
  return (
    <TabsContent value="bank">
      <form className="grid grid-cols-1 gap-y-6 sm:grid-cols-2 gap-x-4">
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
          name="iban"
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
          name="swift"
          render={({ field }) => (
            <FormItem>
              <FormLabel>SWIFT</FormLabel>
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
              <FormLabel>Currency</FormLabel>
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
      </form>
    </TabsContent>
  );
}
