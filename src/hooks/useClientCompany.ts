import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ClientCompany,
  ClientCompanyView,
  APIClientCompanyData,
} from "@/types/ClientCompany";
import axiosClient from "@/lib/axios";
import { tryCatch } from "@/lib/utils";
import { parseClientCompany } from "@/lib/csv/clientCompany";

export function useClients() {
  return useQuery<ClientCompanyView[]>({
    queryKey: ["clients"],
    queryFn: async () => {
      const { data } = await axiosClient.get<ClientCompanyView[]>(
        "/api/client_companies"
      );
      return data;
    },
  });
}

export function useClient(id?: string) {
  return useQuery<ClientCompanyView>({
    queryKey: ["clients", id],
    queryFn: async () => {
      const { data } = await axiosClient.get<ClientCompanyView>(
        `/api/client_companies/${id}`
      );
      return data;
    },
    enabled: !!id,
  });
}

export function useDeleteClient() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const result = await tryCatch(async () => {
        await axiosClient.delete(`/api/client_companies/${id}`);
        return true;
      });

      if (result.error) throw result.error;
      return result.data!;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clients"] });
    },
  });
}

export function useUpdateClient() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: Partial<ClientCompany>;
    }) => {
      const result = await tryCatch(async () => {
        const { data: updatedClient } = await axiosClient.put<ClientCompany>(
          `/api/client_companies/${id}`,
          data
        );
        return updatedClient;
      });

      if (result.error) throw result.error;
      return result.data!;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["clients"] });
      queryClient.invalidateQueries({ queryKey: ["clients", variables.id] });
    },
  });
}

export function useCreateClient() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (
      newClients: APIClientCompanyData | APIClientCompanyData[]
    ) => {
      const result = await tryCatch(async () => {
        const { data } = await axiosClient.post<ClientCompany[]>(
          "/api/client_companies",
          newClients
        );
        return data;
      });

      if (result.error) throw result.error;
      return Array.isArray(newClients) ? result.data! : result.data![0];
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clients"] });
    },
  });
}

export function useParseClientCompanyCsv() {
  return async (file: File) => {
    const { data, error } = await tryCatch(async () => {
      const result = await parseClientCompany(file);
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
