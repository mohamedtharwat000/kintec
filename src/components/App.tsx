"use client";

import { memo } from "react";
import { Toaster } from "@/components/ui/sonner";
import { Providers } from "@/components/Providers";
import { EmailClient } from "@/components/email";

export function App() {
  return (
    <Providers>
      <EmailClient />
      <Toaster
        richColors
        closeButton
        position="top-right"
        toastOptions={{ duration: 5000 }}
      />
    </Providers>
  );
}

export default memo(App);
