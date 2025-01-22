import axiosClient from "@/lib/axios";
import {
  useMutation,
  useQuery,
  type UseMutationOptions,
  type UseQueryOptions,
} from "@tanstack/react-query";
import { MessageListResult } from "@/types/email";
import { MailboxObject } from "imapflow";
import type { ServerInfo } from "@/types/server";

const defaultQueryOptions = {
  staleTime: 60 * 60 * 1000,
  cacheTime: 60 * 60 * 1000,
};

type LoginCredentials = Omit<ServerInfo, "auth"> & {
  email: string;
  password: string;
};

export function useLogin(
  options?: UseMutationOptions<unknown, Error, LoginCredentials>
) {
  return useMutation({
    mutationFn: async (credentials: LoginCredentials) => {
      const { data } = await axiosClient.post("/api/auth/login", credentials);
      return data;
    },
    ...options,
  });
}

export function useMailboxes(options?: UseQueryOptions<MailboxObject[]>) {
  return useQuery<MailboxObject[]>({
    ...defaultQueryOptions,
    queryKey: ["mailboxes"],
    queryFn: async () => {
      const { data } = await axiosClient.get("/api/mailboxes");
      return data.imapMailboxes;
    },
    ...options,
  });
}

export function useMailboxMessages(
  mailboxPath: string | null,
  page: number = 1,
  options?: UseQueryOptions<MessageListResult>
) {
  return useQuery<MessageListResult>({
    ...defaultQueryOptions,
    queryKey: ["mailboxMessages", mailboxPath, page],
    queryFn: async () => {
      if (!mailboxPath) return { messages: [], totalPages: 0, currentPage: 1 };
      const encodedPath = encodeURIComponent(mailboxPath);
      const { data } = await axiosClient.get(
        `/api/mailboxes/${encodedPath}?page=${page}`
      );
      if (!data.success) {
        throw new Error(data.error || "Failed to fetch messages");
      }
      return data;
    },
    enabled: !!mailboxPath,
    ...options,
  });
}
