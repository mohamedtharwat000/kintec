import axiosClient from "@/lib/axios";
import { tryCatch } from "@/lib/utils";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { VisaDetail } from "@/types/VisaDetail";

export function useVisaDetails() {
  return useQuery<VisaDetail[]>({
    queryKey: ["visaDetails"],
    queryFn: async () => {
      const { data } = await axiosClient.get<VisaDetail[]>("/api/visa_details");
      return data;
    },
  });
}

export function useVisaDetail(id: string) {
  return useQuery<VisaDetail>({
    queryKey: ["visaDetails", id],
    queryFn: async () => {
      const { data } = await axiosClient.get<VisaDetail>(
        `/api/visa_details/${id}`
      );
      return data;
    },
    enabled: !!id,
  });
}

export function useCreateVisaDetail() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (
      newVisaDetails: Partial<VisaDetail> | Partial<VisaDetail>[]
    ) => {
      const visaDetailsArray = Array.isArray(newVisaDetails)
        ? newVisaDetails
        : [newVisaDetails];

      const result = await tryCatch(async () => {
        const { data } = await axiosClient.post<VisaDetail[]>(
          "/api/visa_details",
          visaDetailsArray
        );
        return data;
      });

      if (result.error) throw result.error;
      return Array.isArray(newVisaDetails) ? result.data! : result.data![0];
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["visaDetails"] });
      queryClient.invalidateQueries({ queryKey: ["contractors"] });
    },
  });
}

export function useUpdateVisaDetail() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: Partial<VisaDetail>;
    }) => {
      const result = await tryCatch(async () => {
        const { data: updatedVisaDetail } = await axiosClient.put<VisaDetail>(
          `/api/visa_details/${id}`,
          data
        );
        return updatedVisaDetail;
      });

      if (result.error) throw result.error;
      return result.data!;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["visaDetails"] });
      queryClient.invalidateQueries({
        queryKey: ["visaDetails", variables.id],
      });
      queryClient.invalidateQueries({ queryKey: ["contractors"] });
    },
  });
}

export function useDeleteVisaDetail() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const result = await tryCatch(async () => {
        await axiosClient.delete(`/api/visa_details/${id}`);
        return true;
      });

      if (result.error) throw result.error;
      return result.data!;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["visaDetails"] });
      queryClient.invalidateQueries({ queryKey: ["contractors"] });
    },
  });
}
