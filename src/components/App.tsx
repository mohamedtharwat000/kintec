"use client";

import React, { memo, useEffect, useState } from "react";
import { AppSidebar } from "@/components/Sidebar";
import { ClientCompany } from "@/components/pages/ClientCompany";
import { Contractor } from "@/components/pages/Contractor";
import { BankDetail } from "@/components/pages/BankDetail";
import { VisaDetail } from "@/components/pages/VisaDetail";
import { Contract } from "@/components/pages/Contract";
import { Project } from "@/components/pages/Project";
import { ProjectRule } from "@/components/pages/ProjectRule";
import { PurchaseOrder } from "@/components/pages/PurchaseOrder";
import { PoRule } from "@/components/pages/PoRule";
import { CalloffWorkOrder } from "@/components/pages/CalloffWorkOrder";
import { CwoRule } from "@/components/pages/CwoRule";
import { Invoice } from "@/components/pages/Invoice";
import { InvoiceFormattingRule } from "@/components/pages/InvoiceFormattingRule";
import { Expense } from "@/components/pages/Expense";
import { ExpenseValidationRule } from "@/components/pages/ExpenseValidationRule";
import { Rate } from "@/components/pages/Rate";
import { Submission } from "@/components/pages/Submission";
import { SubmissionValidationRule } from "@/components/pages/SubmissionValidationRule";
import { Review } from "@/components/pages/Review";
import { CommonRejection } from "@/components/pages/CommonRejection";
import { SidebarInset } from "@/components/ui/sidebar";
import { SiteHeader } from "@/components/header/site-header";
import { useAppStore } from "@/store/useAppStore";
import AppLogin from "@/components/Login";
import { SidebarRail, SidebarTrigger } from "@/components/ui/sidebar";

interface AppProps {
  dashboard: React.ReactElement;
}

const LoadingSpinner = () => {
  return (
    <div className="flex h-screen w-screen items-center justify-center">
      <div className="h-16 w-16 animate-spin rounded-full border-b-2 border-t-2 border-primary"></div>
    </div>
  );
};

export function App({ dashboard }: AppProps) {
  const [isLoading, setIsLoading] = useState(true);
  const { isAuthenticated } = useAppStore();
  const [currentView, setCurrentView] = useState<string>("dashboard");

  useEffect(() => {
    const authCheckTimer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(authCheckTimer);
  }, []);

  const handleNavigation = (view: string) => {
    setCurrentView(view);
  };

  const renderView = () => {
    switch (currentView) {
      case "dashboard":
        return dashboard;
      case "companies":
        return <ClientCompany />;
      case "contractors":
        return <Contractor />;
      case "bankDetails":
        return <BankDetail />;
      case "visaDetails":
        return <VisaDetail />;
      case "projects":
        return <Project />;
      case "projectRules":
        return <ProjectRule />;
      case "contracts":
        return <Contract />;
      case "purchaseOrders":
        return <PurchaseOrder />;
      case "poRules":
        return <PoRule />;
      case "calloffWorkOrders":
        return <CalloffWorkOrder />;
      case "cwoRules":
        return <CwoRule />;
      case "expenses":
        return <Expense />;
      case "expenseValidationRules":
        return <ExpenseValidationRule />;
      case "invoices":
        return <Invoice />;
      case "invoiceFormattingRules":
        return <InvoiceFormattingRule />;
      case "rates":
        return <Rate />;
      case "submissions":
        return <Submission />;
      case "submissionValidationRules":
        return <SubmissionValidationRule />;
      case "reviews":
        return <Review />;
      case "commonRejections":
        return <CommonRejection />;
    }
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!isAuthenticated) {
    return <AppLogin />;
  }

  return (
    <div className="flex flex-col h-screen w-screen">
      <SiteHeader showUserNav={isAuthenticated} />

      <div className="flex flex-1 overflow-hidden relative">
        <AppSidebar currentView={currentView} onNavigation={handleNavigation} />

        <div className="flex-1 overflow-auto flex justify-center">
          <SidebarInset className="w-full">{renderView()}</SidebarInset>
        </div>
      </div>
      <SidebarTrigger className="fixed bottom-4 left-4 z-50 w-12 h-12 border-2 border-gray-500 rounded-full p-4 bg-background hover:bg-accent md:hidden" />
      <SidebarRail />
    </div>
  );
}

export default memo(App);
