"use client";

import { memo, useState } from "react";
import { Toaster } from "@/components/ui/sonner";
import { Providers } from "@/components/Providers";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { EmailClient } from "@/components/email";
import { Sidebar } from "@/components/Sidebar";
import { AuthWrapper } from "@/components/Auth";
import { Clients } from "@/components/pages/clients";
import { Employees } from "@/components/pages/contractors";
import { Invoices } from "@/components/pages/invoices";

export function App() {
  const [currentView, setCurrentView] = useState<
    "mail" | "clients" | "employees" | "invoices"
  >("mail");

  const handleNavigation = (view: "clients" | "employees" | "invoices") => {
    setCurrentView(view);
  };

  return (
    <div className="flex flex-col h-screen">
      <Providers>
        <Header />
        <AuthWrapper>
          <div className="flex flex-1 overflow-hidden">
            {/* Sidebar with dummy mailbox callback */}
            <div className="w-72 border-r">
              <Sidebar
                selectedMailbox="" // no longer used by App
                currentView={currentView}
                onMailboxSelect={() => setCurrentView("mail")}
                onNavigation={handleNavigation}
              />
            </div>
            {/* Render the current view */}
            <div className="flex-1 overflow-auto">
              {currentView === "mail" && <EmailClient />}
              {currentView === "clients" && <Clients />}
              {currentView === "employees" && <Employees />}
              {currentView === "invoices" && <Invoices />}
            </div>
          </div>
        </AuthWrapper>
        <Footer />
        <Toaster
          richColors
          closeButton
          position="top-right"
          toastOptions={{ duration: 5000 }}
        />
      </Providers>
    </div>
  );
}

export default memo(App);
