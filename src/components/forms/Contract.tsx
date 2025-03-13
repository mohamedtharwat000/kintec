import React, { useEffect } from "react";
import { Save, X, Loader2, CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
  useContract,
  useCreateContract,
  useUpdateContract,
} from "@/hooks/useContracts";
import { useClients } from "@/hooks/useClientCompany";
import { useContractors } from "@/hooks/useContractor";
import { useProjects } from "@/hooks/useProjects";
import { ContractStatus } from "@/types/Contract";
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
  contractor_id: z.string().min(1, "Contractor is required"),
  client_company_id: z.string().min(1, "Client company is required"),
  project_id: z.string().min(1, "Project is required"),
  contract_start_date: z.date({
    required_error: "Start date is required",
  }),
  contract_end_date: z.date({
    required_error: "End date is required",
  }),
  job_title: z.string().min(1, "Job title is required"),
  job_type: z.string().min(1, "Job type is required"),
  job_number: z.string().min(1, "Job number is required"),
  kintec_cost_centre_code: z.string().min(1, "Cost centre code is required"),
  description_of_services: z.string().optional(),
  contract_status: z.nativeEnum(ContractStatus),
});

type FormData = z.infer<typeof formSchema>;

interface ContractFormProps {
  contractId?: string;
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function ContractForm({
  contractId,
  open,
  onClose,
  onSuccess,
}: ContractFormProps) {
  const isEditing = !!contractId;
  const { data: existingContract, isLoading: isLoadingContract } = useContract(
    contractId || ""
  );

  const { data: clients = [] } = useClients();
  const { data: contractors = [] } = useContractors();
  const { data: projects = [] } = useProjects();

  const createContract = useCreateContract();
  const updateContract = useUpdateContract();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      contractor_id: "",
      client_company_id: "",
      project_id: "",
      contract_start_date: new Date(),
      contract_end_date: new Date(),
      job_title: "",
      job_type: "",
      job_number: "",
      kintec_cost_centre_code: "",
      description_of_services: "",
      contract_status: ContractStatus.active,
    },
  });

  useEffect(() => {
    if (isEditing && existingContract) {
      form.reset({
        contractor_id: existingContract.contractor_id,
        client_company_id: existingContract.client_company_id,
        project_id: existingContract.project_id,
        contract_start_date: new Date(existingContract.contract_start_date),
        contract_end_date: new Date(existingContract.contract_end_date),
        job_title: existingContract.job_title,
        job_type: existingContract.job_type,
        job_number: existingContract.job_number,
        kintec_cost_centre_code: existingContract.kintec_cost_centre_code,
        description_of_services: existingContract.description_of_services || "",
        contract_status: existingContract.contract_status,
      });
    } else if (!isEditing && open) {
      form.reset({
        contractor_id: "",
        client_company_id: "",
        project_id: "",
        contract_start_date: new Date(),
        contract_end_date: new Date(),
        job_title: "",
        job_type: "",
        job_number: "",
        kintec_cost_centre_code: "",
        description_of_services: "",
        contract_status: ContractStatus.active,
      });
    }
  }, [existingContract, form, isEditing, open]);

  const onSubmit = async (data: FormData) => {
    const { error } = await tryCatch(async () => {
      if (isEditing) {
        await updateContract.mutateAsync({
          id: contractId,
          data: {
            ...data,
          },
        });
        toast.success("Contract updated successfully");
      } else {
        await createContract.mutateAsync({
          ...data,
        });
        toast.success("Contract added successfully");
      }

      if (onSuccess) {
        onSuccess();
      }
      onClose();
    });

    if (error) {
      console.error(error);
      toast.error(
        isEditing ? "Failed to update contract" : "Failed to create contract"
      );
    }
  };

  const isSubmitting = createContract.isPending || updateContract.isPending;

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
            {isEditing ? "Edit Contract" : "Add New Contract"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Update contract details."
              : "Enter details for the new contract."}
          </DialogDescription>
        </DialogHeader>

        {isEditing && isLoadingContract ? (
          <div className="flex justify-center items-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="client_company_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Client Company</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      value={field.value}
                      disabled={isSubmitting}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a company" />
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
                name="contractor_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contractor</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      value={field.value}
                      disabled={isSubmitting}
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
                            {contractor.first_name} {contractor.last_name}
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
                      value={field.value}
                      disabled={isSubmitting}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a project" />
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="job_title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Job Title</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g., Senior Developer"
                          {...field}
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
                          placeholder="e.g., Full-time, Contract"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="job_number"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Job Number</FormLabel>
                      <FormControl>
                        <Input placeholder="JOB-123" {...field} />
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
                        <Input placeholder="e.g., CC-001" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="contract_start_date"
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
                  name="contract_end_date"
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

              <FormField
                control={form.control}
                name="contract_status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contract Status</FormLabel>
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
                        {Object.values(ContractStatus).map((status) => (
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
                name="description_of_services"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description of Services</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Enter a detailed description of services covered by this contract..."
                        className="min-h-32"
                        {...field}
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
