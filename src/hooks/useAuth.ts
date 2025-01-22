import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";
import axiosClient from "@/lib/axios";
import { useAuthStore } from "@/store/useAuthStore";

interface LoginCredentials {
  email: string;
  password: string;
  host: string;
  port: number;
}

export function useAuth() {
  const queryClient = useQueryClient();
  const { setAuthenticated, setProvider } = useAuthStore();

  const loginMutation = useMutation({
    mutationKey: ["auth", "login"],
    mutationFn: async (credentials: LoginCredentials) => {
      const { data } = await axiosClient.post("api/auth/login", credentials);
      return data;
    },
    onSuccess: (data) => {
      setAuthenticated(true, data.user.email);
      setProvider(data.user.provider);
      queryClient.invalidateQueries({ queryKey: ["user"] });
    },
    retry: 1,
  });

  const login = useCallback(
    async (credentials: LoginCredentials) => {
      return loginMutation.mutateAsync(credentials);
    },
    [loginMutation]
  );

  const logout = useCallback(() => {
    useAuthStore.getState().reset();
    queryClient.clear();
  }, [queryClient]);

  return {
    login,
    logout,
    isLoading: loginMutation.isPending,
    error: loginMutation.error,
    isError: loginMutation.isError,
    isSuccess: loginMutation.isSuccess,
  };
}
