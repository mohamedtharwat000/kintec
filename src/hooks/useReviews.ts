import axiosClient from "@/lib/axios";
import { tryCatch } from "@/lib/utils";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Review, APIReviewData } from "@/types/Review";
import { parseReview } from "@/lib/csv/review";

export function useReviews() {
  return useQuery<Review[]>({
    queryKey: ["reviews"],
    queryFn: async () => {
      const { data } = await axiosClient.get<Review[]>("/api/reviews");
      return data;
    },
  });
}

export function useReview(id?: string) {
  return useQuery<Review>({
    queryKey: ["reviews", id],
    queryFn: async () => {
      const { data } = await axiosClient.get<Review>(`/api/reviews/${id}`);
      return data;
    },
    enabled: !!id,
  });
}

export function useReviewsBySubmission(submissionId?: string) {
  return useQuery<Review[]>({
    queryKey: ["reviews", "submission", submissionId],
    queryFn: async () => {
      const { data } = await axiosClient.get<Review[]>(
        `/api/reviews?submissionId=${submissionId}`
      );
      return data;
    },
    enabled: !!submissionId,
  });
}

export function useDeleteReview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const result = await tryCatch(async () => {
        await axiosClient.delete(`/api/reviews/${id}`);
        return true;
      });

      if (result.error) throw result.error;
      return result.data!;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reviews"] });
    },
  });
}

export function useUpdateReview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Review> }) => {
      const result = await tryCatch(async () => {
        const { data: updatedReview } = await axiosClient.put<Review>(
          `/api/reviews/${id}`,
          data
        );
        return updatedReview;
      });

      if (result.error) throw result.error;
      return result.data!;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["reviews"] });
      queryClient.invalidateQueries({ queryKey: ["reviews", variables.id] });
      if (data.submission_id) {
        queryClient.invalidateQueries({
          queryKey: ["reviews", "submission", data.submission_id],
        });
        queryClient.invalidateQueries({
          queryKey: ["submissions", data.submission_id],
        });
        queryClient.invalidateQueries({ queryKey: ["submissions"] });
      }
    },
  });
}

export function useCreateReview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (newReviews: APIReviewData | APIReviewData[]) => {
      const result = await tryCatch(async () => {
        const { data } = await axiosClient.post<Review[]>(
          "/api/reviews",
          newReviews
        );
        return data;
      });

      if (result.error) throw result.error;
      return Array.isArray(newReviews) ? result.data! : result.data![0];
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["reviews"] });

      const reviewsArray = Array.isArray(data) ? data : [data];

      const submissionIds = new Set<string>();

      reviewsArray.forEach((review) => {
        if (review.submission_id) {
          submissionIds.add(review.submission_id);
        }
      });

      submissionIds.forEach((id) => {
        queryClient.invalidateQueries({
          queryKey: ["reviews", "submission", id],
        });
        queryClient.invalidateQueries({ queryKey: ["submissions", id] });
      });

      if (submissionIds.size > 0) {
        queryClient.invalidateQueries({ queryKey: ["submissions"] });
      }
    },
  });
}

export function useParseReviewCsv() {
  return async (file: File) => {
    const { data, error } = await tryCatch(async () => {
      const result = await parseReview(file);
      return result;
    });
    if (error) return { error };
    return { data };
  };
}

export function useSearchFilter<T extends Record<string, any>>(
  data: T[],
  searchTerm: string,
  searchFields: (keyof T)[]
): T[] {
  if (!searchTerm.trim()) return data;

  const lowercaseSearchTerm = searchTerm.toLowerCase();

  return data.filter((item) =>
    searchFields.some((field) => {
      const fieldValue = item[field];
      return (
        fieldValue &&
        String(fieldValue).toLowerCase().includes(lowercaseSearchTerm)
      );
    })
  );
}
