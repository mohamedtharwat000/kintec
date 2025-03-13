import axiosClient from "@/lib/axios";
import { tryCatch } from "@/lib/utils";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Review } from "@/types/Review";

export function useReviews() {
  return useQuery<Review[]>({
    queryKey: ["reviews"],
    queryFn: async () => {
      const { data } = await axiosClient.get<Review[]>("/api/reviews");
      return data;
    },
  });
}

export function useReview(id: string) {
  return useQuery<Review>({
    queryKey: ["reviews", id],
    queryFn: async () => {
      const { data } = await axiosClient.get<Review>(`/api/reviews/${id}`);
      return data;
    },
    enabled: !!id,
  });
}

export function useCreateReview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (newReview: any) => {
      const result = await tryCatch(async () => {
        const { data } = await axiosClient.post<Review>(
          "/api/reviews",
          newReview
        );
        return data;
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
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
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
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["reviews"] });
      queryClient.invalidateQueries({ queryKey: ["reviews", variables.id] });
    },
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
