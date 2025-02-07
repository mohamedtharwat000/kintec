"use client";

import React from "react";
import { useAuthStore } from "@/store/useAuthStore";
import LoginForm from "@/components/LoginForm";

export function AuthWrapper({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore();

  if (!isAuthenticated) {
    return <LoginForm />;
  }

  return children;
}
