import React, { useEffect } from "react";
import { Save, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  useContract,
  useCreateContract,
  useUpdateContract,
  useContractors,
  useClients,
  useProjects,
} from "@/hooks/useApp";
import { Contract, ContractStatus } from "@/types/contract";
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

const formSchema = z.object({
  contract_id: z.string().min(1, "Contract ID is required"),
  contractor_id: z.string().min(1, "Contractor is required"),
  client_company_id: z.string().min(1, "Client company is required"),
  project_id: z.string().min(1, "Project is required"),
  contract_start_date: z.string().min(1, "Start date is required"),
  contract_end_date: z.string().min(1, "End date is required"),
  job_title: z.string().min(1, "Job title is required"),
  job_type: z.string().min(1, "Job type is required"),
  job_number: z.string().min(1, "Job number is required"),
  kintec_cost_centre_code: z.string().min(1, "Cost center code is required"),
  description_of_services: z.string().optional(),
  contract_status: z.nativeEnum(ContractStatus),
  PO_id: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

interface ContractFormProps {
  contractId?: string;
  onCancel: () => void;
  onSuccess?: () => void;
}

export function ContractForm({
  contractId,
  onCancel,
  onSuccess,
}: ContractFormProps) {
  const isEditing = !!contractId;
  const { data: existingContract, isLoading: isLoadingContract } = useContract(
    contractId || ""
  );
  const { data: contractors = [] } = useContractors();
  const { data: clients = [] } = useClients();
  const { data: projects = [] } = useProjects();

  const createContract = useCreateContract();
  const updateContract = useUpdateContract();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      contract_id: "",
      contractor_id: "",
      client_company_id: "",
      project_id: "",
      contract_start_date: "",
      contract_end_date: "",
      job_title: "",
      job_type: "",
      job_number: "",
      kintec_cost_centre_code: "",
      description_of_services: "",
      contract_status: ContractStatus.active,
      PO_id: "",
    },
  });

  // Populate form when editing existing contract
  useEffect(() => {
    if (isEditing && existingContract) {
      form.reset({
        contract_id: existingContract.contract_id,
        contractor_id: existingContract.contractor_id,
        client_company_id: existingContract.client_company_id,
        project_id: existingContract.project_id,
        contract_start_date:
          existingContract.contract_start_date instanceof Date
            ? existingContract.contract_start_date.toISOString().split("T")[0]
            : "",
        contract_end_date:
          existingContract.contract_end_date instanceof Date
            ? existingContract.contract_end_date.toISOString().split("T")[0]
            : "",
        job_title: existingContract.job_title,
        job_type: existingContract.job_type,
        job_number: existingContract.job_number,
        kintec_cost_centre_code: existingContract.kintec_cost_centre_code,
        description_of_services: existingContract.description_of_services || "",
        contract_status: existingContract.contract_status,
        PO_id: existingContract.PO_id || "",
      });
    }
  }, [existingContract, form, isEditing]);

  const onSubmit = async (data: FormData) => {
    try {
      // Convert string dates to Date objects
      const formattedData = {
        ...data,
        contract_start_date: new Date(data.contract_start_date),
        contract_end_date: new Date(data.contract_end_date),
      };

      if (isEditing) {
        await updateContract.mutateAsync({
          id: contractId!,
          data: formattedData,
        });
        toast.success("Contract updated successfully");
      } else {
        await createContract.mutateAsync(formattedData as Omit<Contract, "id">);
        toast.success("Contract created successfully");
      }

      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error(error);
      toast.error(
        isEditing ? "Failed to update contract" : "Failed to create contract"
      );
    }
  };

  const isSubmitting = createContract.isPending || updateContract.isPending;

  if (isEditing && isLoadingContract) {
    return (
      <div className="flex justify-center items-center min-h-[300px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="py-6">
      <div className="max-w-4xl mx-auto px-4">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-semibold">
              {isEditing ? "Edit Contract" : "Add New Contract"}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {isEditing
                ? "Update the contract details below"
                : "Complete the required details to add a new contract."}
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
          <CardContent className="pt-6">
            <Form {...form}>
              <form className="grid grid-cols-1 gap-y-6 sm:grid-cols-2 gap-x-4">
                <FormField
                  control={form.control}
                  name="contract_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Contract ID</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g., CTR001"
                          {...field}
                          disabled={isEditing || isSubmitting} // ID shouldn't be editable
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="job_number"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Job Number</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter job number"
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
                  name="contractor_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Contractor</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select contractor" />
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
                  name="client_company_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Client Company</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select client company" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {clients.map((client) => (
                            <SelectItem
                              key={client.client_company_id}
                              value={client.client_company_id}
                            >
                              {client.client_name}
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
                  name="project_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Project</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select project" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {projects.map((project) => (
                            <SelectItem
                              key={project.project_id}
                              value={project.project_id}
                            >
                              {project.project_name}
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
                  name="job_type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Job Type</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter job type"
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
                  name="contract_start_date"
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
                  name="contract_end_date"
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
                  name="kintec_cost_centre_code"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cost Centre Code</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter cost centre code"
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
                  name="PO_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Purchase Order ID (Optional)</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter PO ID"
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
                  name="contract_status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Contract Status</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {Object.values(ContractStatus).map((status) => (
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
                  name="description_of_services"
                  render={({ field }) => (
                    <FormItem className="sm:col-span-2">
                      <FormLabel>Description of Services (Optional)</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Enter description of services"
                          className="resize-none min-h-[100px]"
                          {...field}
                          disabled={isSubmitting}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
