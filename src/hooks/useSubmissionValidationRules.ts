import axiosClient from "@/lib/axios";
import { tryCatch } from "@/lib/utils";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  SubmissionValidationRule,
  APISubmissionValidationRuleData,
} from "@/types/SubmissionValidationRule";
import { parseSubmissionValidationRule } from "@/lib/csv/submissionValidationRule";

export function useSubmissionValidationRules() {
  return useQuery<SubmissionValidationRule[]>({
    queryKey: ["submissionValidationRules"],
    queryFn: async () => {
      const { data } = await axiosClient.get<SubmissionValidationRule[]>(
        "/api/sub_validation_rules"
      );
      return data;
    },
  });
}

export function useSubmissionValidationRule(id?: string) {
  return useQuery<SubmissionValidationRule>({
    queryKey: ["submissionValidationRules", id],
    queryFn: async () => {
      const { data } = await axiosClient.get<SubmissionValidationRule>(
        `/api/sub_validation_rules/${id}`
      );
      return data;
    },
    enabled: !!id,
  });
}

export function useDeleteSubmissionValidationRule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const result = await tryCatch(async () => {
        await axiosClient.delete(`/api/sub_validation_rules/${id}`);
        return true;
      });

      if (result.error) throw result.error;
      return result.data!;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["submissionValidationRules"],
      });
    },
  });
}

export function useUpdateSubmissionValidationRule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: Partial<SubmissionValidationRule>;
    }) => {
      const result = await tryCatch(async () => {
        const { data: updatedRule } =
          await axiosClient.put<SubmissionValidationRule>(
            `/api/sub_validation_rules/${id}`,
            data
          );
        return updatedRule;
      });

      if (result.error) throw result.error;
      return result.data!;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["submissionValidationRules"],
      });
      queryClient.invalidateQueries({
        queryKey: ["submissionValidationRules", variables.id],
      });
    },
  });
}

export function useCreateSubmissionValidationRule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (
      newRules:
        | APISubmissionValidationRuleData
        | APISubmissionValidationRuleData[]
    ) => {
      const result = await tryCatch(async () => {
        const { data } = await axiosClient.post<SubmissionValidationRule[]>(
          "/api/sub_validation_rules",
          newRules
        );
        return data;
      });

      if (result.error) throw result.error;
      return Array.isArray(newRules) ? result.data! : result.data![0];
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["submissionValidationRules"],
      });
    },
  });
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

export function useParseSubmissionValidationRuleCsv() {
  return async (file: File) => {
    const { data, error } = await tryCatch(async () => {
      const result = await parseSubmissionValidationRule(file);
      return result;
    });
    if (error) return { error };
    return { data };
  };
}
