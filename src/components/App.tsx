"use client";

import { memo, useState } from "react";
import { Toaster } from "@/components/ui/sonner";
import { AppSidebar } from "@/components/Sidebar";
import { ClientCompany } from "@/components/pages/ClientCompany";
import { Contractor } from "@/components/pages/Contractor";
import { SidebarInset, useSidebar } from "@/components/ui/sidebar";
import { SiteHeader } from "@/components/header/site-header";
import { useAppStore } from "@/store/useAppStore";
import AppLogin from "@/components/Login";

export function App() {
  const { isAuthenticated } = useAppStore();
  const [currentView, setCurrentView] = useState<"contractors" | "companies">(
    "contractors"
  );

  const handleNavigation = (view: "contractors" | "companies") => {
    setCurrentView(view);
    if (window.innerWidth < 768) {
      const { closeSidebar } = useSidebar();
      closeSidebar();
    }
  };

  return (
    <div className="flex flex-col h-screen [--header-height:calc(theme(spacing.14))]">
      <SiteHeader showUserNav={isAuthenticated} />
      <div className="flex-1">
        {/* {!isAuthenticated ? (
          <AppLogin />
        ) : ( */}
        <div className="flex flex-1 overflow-hidden">
          <AppSidebar
            currentView={currentView}
            onNavigation={handleNavigation}
          />
          <SidebarInset className="w-full">
            <div className="flex flex-1 p-2 sm:p-4 overflow-auto w-full">
              <div className="w-full">
                {currentView === "contractors" && <Contractor />}
                {currentView === "companies" && <ClientCompany />}
              </div>
            </div>
          </SidebarInset>
        </div>
        {/* )} */}
      </div>
      <Toaster
        richColors
        closeButton
        position="top-right"
        toastOptions={{ duration: 5000 }}
      />
    </div>
  );
}

export default memo(App);
