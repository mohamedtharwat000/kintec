"use client";

import React from "react";
import { useAuthStore } from "@/store/useAuthStore";
import LoginForm from "@/components/LoginForm";
// import { Spinner } from "@/components/ui/spinner";
// import { getLocalStoreData } from "@/lib/utils";

export function AuthWrapper({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore();

  // const isLoading = React.useMemo(() => {
  //   if (isAuthenticated) return false;
  //   const localAuthenticated = getLocalStoreData("isAuthenticated");
  //   if (localAuthenticated) return true;
  // }, [isAuthenticated]);

  if (!isAuthenticated) {
    return <LoginForm />;
  }

  return children;
}
