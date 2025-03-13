import React, { useEffect } from "react";
import { Save, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { DatePicker } from "@/components/ui/date-picker";
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
  useReview,
  useCreateReview,
  useUpdateReview,
} from "@/hooks/useReviews";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useSubmissions } from "@/hooks/useSubmissions";
import { ReviewStatus, OverallValidationStatus } from "@/types/Review";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

// Define the schema for the form
const formSchema = z.object({
  submission_id: z.string().min(1, "Submission ID is required"),
  special_review_required: z.boolean().default(false),
  reviewer_name: z.string().min(1, "Reviewer name is required"),
  review_status: z.nativeEnum(ReviewStatus),
  review_timestamp: z.date({ required_error: "Review date is required" }),
  review_rejection_reason: z.string().optional(),
  overall_validation_status: z.nativeEnum(OverallValidationStatus),
  last_overall_validation_date: z.date({
    required_error: "Last validation date is required",
  }),
  updated_by: z.string().min(1, "Updated by is required"),
  notes: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

interface ReviewFormProps {
  reviewId?: string;
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function ReviewForm({
  reviewId,
  open,
  onClose,
  onSuccess,
}: ReviewFormProps) {
  const isEditing = !!reviewId;
  const { data: existingReview, isLoading: isLoadingReview } = useReview(
    reviewId || ""
  );
  const createReview = useCreateReview();
  const updateReview = useUpdateReview();
  const { data: submissions = [] } = useSubmissions();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      submission_id: "",
      special_review_required: false,
      reviewer_name: "",
      review_status: ReviewStatus.pending,
      review_rejection_reason: "",
      overall_validation_status: OverallValidationStatus.approved,
      updated_by: "",
      notes: "",
    },
  });

  // Populate form when editing existing review
  useEffect(() => {
    if (isEditing && existingReview) {
      form.reset({
        submission_id: existingReview.submission_id,
        special_review_required: existingReview.special_review_required,
        reviewer_name: existingReview.reviewer_name,
        review_status: existingReview.review_status,
        review_timestamp: new Date(existingReview.review_timestamp),
        review_rejection_reason: existingReview.review_rejection_reason || "",
        overall_validation_status: existingReview.overall_validation_status,
        last_overall_validation_date: new Date(
          existingReview.last_overall_validation_date
        ),
        updated_by: existingReview.updated_by,
        notes: existingReview.notes || "",
      });
    }
  }, [existingReview, form, isEditing]);

  const onSubmit = async (data: FormData) => {
    try {
      const reviewData = {
        ...data,
        review_timestamp: data.review_timestamp.toISOString(),
        last_overall_validation_date:
          data.last_overall_validation_date.toISOString(),
      };

      if (isEditing) {
        await updateReview.mutateAsync({
          id: reviewId!,
          data: reviewData,
        });
        toast.success("Review updated successfully");
      } else {
        await createReview.mutateAsync(reviewData);
        toast.success("Review added successfully");
      }

      if (onSuccess) {
        onSuccess();
      }
      onClose();
    } catch (error) {
      console.error(error);
      toast.error(
        isEditing ? "Failed to update review" : "Failed to create review"
      );
    }
  };

  const isSubmitting = createReview.isPending || updateReview.isPending;
  const watchReviewStatus = form.watch("review_status");

  return (
    <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Edit Review" : "Add New Review"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Update the review information."
              : "Enter details for the new review."}
          </DialogDescription>
        </DialogHeader>

        {isEditing && isLoadingReview ? (
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
                name="special_review_required"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                    <div className="space-y-0.5">
                      <FormLabel className="text-sm">
                        Special Review Required
                      </FormLabel>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        disabled={isSubmitting}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="reviewer_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Reviewer Name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter reviewer's name"
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
                name="review_status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Review Status</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      disabled={isSubmitting}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value={ReviewStatus.pending}>
                          Pending
                        </SelectItem>
                        <SelectItem value={ReviewStatus.approved}>
                          Approved
                        </SelectItem>
                        <SelectItem value={ReviewStatus.rejected}>
                          Rejected
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="review_timestamp"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Review Date</FormLabel>
                    <DatePicker
                      date={field.value}
                      setDate={field.onChange}
                      disabled={isSubmitting}
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />

              {watchReviewStatus === ReviewStatus.rejected && (
                <FormField
                  control={form.control}
                  name="review_rejection_reason"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Rejection Reason</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Enter rejection reason..."
                          {...field}
                          disabled={isSubmitting}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              <FormField
                control={form.control}
                name="overall_validation_status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Overall Validation Status</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      disabled={isSubmitting}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select validation status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value={OverallValidationStatus.approved}>
                          Approved
                        </SelectItem>
                        <SelectItem value={OverallValidationStatus.rejected}>
                          Rejected
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="last_overall_validation_date"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Last Validation Date</FormLabel>
                    <DatePicker
                      date={field.value}
                      setDate={field.onChange}
                      disabled={isSubmitting}
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="updated_by"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Updated By</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter name or user ID"
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
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Enter additional notes..."
                        {...field}
                        disabled={isSubmitting}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
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
