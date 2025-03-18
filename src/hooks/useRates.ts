import axiosClient from "@/lib/axios";
import { tryCatch } from "@/lib/utils";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Rate, RateView, APIRateData } from "@/types/Rate";
import { parseRate } from "@/lib/csv/rate";

export function useRates() {
  return useQuery<RateView[]>({
    queryKey: ["rates"],
    queryFn: async () => {
      const { data } = await axiosClient.get<RateView[]>("/api/rates");
      return data;
    },
  });
}

export function useRate(id?: string) {
  return useQuery<RateView>({
    queryKey: ["rates", id],
    queryFn: async () => {
      const { data } = await axiosClient.get<RateView>(`/api/rates/${id}`);
      return data;
    },
    enabled: !!id,
  });
}

export function useDeleteRate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const result = await tryCatch(async () => {
        await axiosClient.delete(`/api/rates/${id}`);
        return true;
      });

      if (result.error) throw result.error;
      return result.data!;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rates"] });
    },
  });
}

export function useUpdateRate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Rate> }) => {
      const result = await tryCatch(async () => {
        const { data: updatedRate } = await axiosClient.put<Rate>(
          `/api/rates/${id}`,
          data
        );
        return updatedRate;
      });

      if (result.error) throw result.error;
      return result.data!;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["rates"] });
      queryClient.invalidateQueries({ queryKey: ["rates", variables.id] });
    },
  });
}

export function useCreateRate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (newRates: APIRateData | APIRateData[]) => {
      const result = await tryCatch(async () => {
        const { data } = await axiosClient.post<Rate[]>("/api/rates", newRates);
        return data;
      });

      if (result.error) throw result.error;
      return Array.isArray(newRates) ? result.data! : result.data![0];
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rates"] });
    },
  });
}

export function useParseRateCsv() {
  return async (file: File) => {
    const { data, error } = await tryCatch(async () => {
      const result = await parseRate(file);
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
