import React, { useEffect } from "react";
import { Save, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
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
  useSubmissionValidationRule,
  useCreateSubmissionValidationRule,
  useUpdateSubmissionValidationRule,
} from "@/hooks/useSubmissionValidationRules";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useSubmissions } from "@/hooks/useSubmissions";
import { RequiredFields } from "@/types/SubmissionValidationRule";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { tryCatch } from "@/lib/utils";

// Define the schema for the form
const formSchema = z.object({
  submission_id: z.string().min(1, "Submission ID is required"),
  approval_signature_rules: z.string().optional(),
  approval_date_rules: z.string().optional(),
  required_fields: z.nativeEnum(RequiredFields).optional(),
  template_requirements: z.string().optional(),
  workday_definitions: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

interface SubmissionValidationRuleFormProps {
  ruleId?: string;
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function SubmissionValidationRuleForm({
  ruleId,
  open,
  onClose,
  onSuccess,
}: SubmissionValidationRuleFormProps) {
  const isEditing = !!ruleId;
  const { data: existingRule, isLoading: isLoadingRule } =
    useSubmissionValidationRule(ruleId || "");
  const createRule = useCreateSubmissionValidationRule();
  const updateRule = useUpdateSubmissionValidationRule();
  const { data: submissions = [] } = useSubmissions();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      submission_id: "",
      approval_signature_rules: "",
      approval_date_rules: "",
      required_fields: undefined,
      template_requirements: "",
      workday_definitions: "",
    },
  });

  // Populate form when editing existing rule
  useEffect(() => {
    if (isEditing && existingRule) {
      form.reset({
        submission_id: existingRule.submission_id,
        approval_signature_rules: existingRule.approval_signature_rules || "",
        approval_date_rules: existingRule.approval_date_rules || "",
        required_fields:
          (existingRule.required_fields as RequiredFields) || undefined,
        template_requirements: existingRule.template_requirements || "",
        workday_definitions: existingRule.workday_definitions || "",
      });
    } else if (!isEditing && open) {
      // Reset form when opening in create mode
      form.reset({
        submission_id: "",
        approval_signature_rules: "",
        approval_date_rules: "",
        required_fields: undefined,
        template_requirements: "",
        workday_definitions: "",
      });
    }
  }, [existingRule, form, isEditing, open]);

  const onSubmit = async (data: FormData) => {
    const { error } = await tryCatch(async () => {
      if (isEditing) {
        await updateRule.mutateAsync({
          id: ruleId!,
          data,
        });
        toast.success("Validation rule updated successfully");
      } else {
        await createRule.mutateAsync({
          submission_id: data.submission_id,
          approval_signature_rules: data.approval_signature_rules || null,
          approval_date_rules: data.approval_date_rules || null,
          required_fields: data.required_fields || null,
          template_requirements: data.template_requirements || null,
          workday_definitions: data.workday_definitions || null,
        });
        toast.success("Validation rule added successfully");
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
          ? "Failed to update validation rule"
          : "Failed to create validation rule"
      );
    }
  };

  const isSubmitting = createRule.isPending || updateRule.isPending;

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
            {isEditing ? "Edit Validation Rule" : "Add New Validation Rule"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Update the validation rule information."
              : "Enter details for the new validation rule."}
          </DialogDescription>
        </DialogHeader>

        {isEditing && isLoadingRule ? (
          <div className="flex justify-center items-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="submission_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Submission</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      value={field.value}
                      disabled={isSubmitting || isEditing}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select submission" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {submissions.map((submission) => (
                          <SelectItem
                            key={submission.submission_id}
                            value={submission.submission_id}
                          >
                            {submission.submission_id}
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
                name="required_fields"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Required Fields</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                      disabled={isSubmitting}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select required fields type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value={RequiredFields.REG}>
                          Regular
                        </SelectItem>
                        <SelectItem value={RequiredFields.EXP}>
                          Expanded
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="approval_signature_rules"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Approval Signature Rules</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Enter signature rules..."
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
                name="approval_date_rules"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Approval Date Rules</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Enter date rules..."
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
                name="template_requirements"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Template Requirements</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Enter template requirements..."
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
                name="workday_definitions"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Workday Definitions</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Enter workday definitions..."
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
