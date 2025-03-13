"use client";

import React from "react";
import {
  Building2,
  Users,
  CreditCard,
  BookCheck,
  ChevronRight,
  LayoutDashboard,
  Briefcase,
  ClipboardList,
  FileText,
  Receipt,
  ClipboardCheck,
  FileSpreadsheet,
  ScrollText,
  FileOutput,
  FileCheck,
  DollarSign,
  ClipboardEdit,
  ArrowDownUp,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarGroup,
  SidebarGroupContent,
} from "@/components/ui/sidebar";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";

interface SidebarProps {
  currentView: string;
  onNavigation: (view: string) => void;
}

export function AppSidebar({ currentView, onNavigation }: SidebarProps) {
  return (
    <Sidebar className="absolute top-2">
      <SidebarContent className="bg-background text-foreground">
        <SidebarGroup className="bg-background text-foreground">
          <SidebarGroupContent className="bg-background text-foreground">
            <SidebarMenu>
              {/* Dashboard Section */}
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={currentView === "dashboard"}
                  onClick={() => onNavigation("dashboard")}
                  className={cn(
                    "cursor-pointer transition-all relative",
                    "hover:bg-accent",
                    currentView === "dashboard" && ["!bg-gray-500"]
                  )}
                >
                  <div className="flex items-center">
                    <LayoutDashboard className="h-4 w-4 mr-2" />
                    <span>Dashboard</span>
                  </div>
                </SidebarMenuButton>
              </SidebarMenuItem>

              {/* Companies Section */}
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={currentView === "companies"}
                  onClick={() => onNavigation("companies")}
                  className={cn(
                    "cursor-pointer transition-all relative",
                    "hover:bg-accent",
                    currentView === "companies" && ["!bg-gray-500"]
                  )}
                >
                  <div className="flex items-center">
                    <Building2 className="h-4 w-4 mr-2" />
                    <span>Companies</span>
                  </div>
                </SidebarMenuButton>
              </SidebarMenuItem>

              {/* Contractors Section */}
              <Collapsible
                defaultOpen={
                  currentView === "contractors" ||
                  currentView === "bankDetails" ||
                  currentView === "visaDetails"
                }
              >
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <CollapsibleTrigger className="flex items-center justify-between w-full">
                      <div className="flex items-center">
                        <Users
                          className={cn(
                            "h-4 w-4 mr-2",
                            (currentView === "contractors" ||
                              currentView === "bankDetails" ||
                              currentView === "visaDetails") &&
                              "text-primary"
                          )}
                        />
                        <span>Contractors</span>
                      </div>
                      <ChevronRight className="h-4 w-4 transition-transform group-data-[state=open]/collapsible:rotate-90" />
                    </CollapsibleTrigger>
                  </SidebarMenuButton>
                </SidebarMenuItem>

                <CollapsibleContent>
                  <SidebarMenu className="pl-4">
                    <SidebarMenuItem>
                      <SidebarMenuButton
                        asChild
                        isActive={currentView === "contractors"}
                        onClick={() => onNavigation("contractors")}
                        className={cn(
                          "cursor-pointer transition-all relative",
                          "hover:bg-accent",
                          currentView === "contractors" && ["!bg-accent"]
                        )}
                      >
                        <div className="flex items-center">
                          <Users
                            className={cn(
                              "h-4 w-4 mr-2",
                              currentView === "contractors" && "text-primary"
                            )}
                          />
                          <span>Contractor Data</span>
                        </div>
                      </SidebarMenuButton>
                    </SidebarMenuItem>

                    <SidebarMenuItem>
                      <SidebarMenuButton
                        asChild
                        isActive={currentView === "bankDetails"}
                        onClick={() => onNavigation("bankDetails")}
                        className={cn(
                          "cursor-pointer transition-all relative",
                          "hover:bg-accent",
                          currentView === "bankDetails" && ["!bg-accent"]
                        )}
                      >
                        <div className="flex items-center">
                          <CreditCard
                            className={cn(
                              "h-4 w-4 mr-2",
                              currentView === "bankDetails" && "text-primary"
                            )}
                          />
                          <span>Bank Details</span>
                        </div>
                      </SidebarMenuButton>
                    </SidebarMenuItem>

                    <SidebarMenuItem>
                      <SidebarMenuButton
                        asChild
                        isActive={currentView === "visaDetails"}
                        onClick={() => onNavigation("visaDetails")}
                        className={cn(
                          "cursor-pointer transition-all relative",
                          "hover:bg-accent",
                          currentView === "visaDetails" && ["!bg-accent"]
                        )}
                      >
                        <div className="flex items-center">
                          <BookCheck
                            className={cn(
                              "h-4 w-4 mr-2",
                              currentView === "visaDetails" && "text-primary"
                            )}
                          />
                          <span>Visa Details</span>
                        </div>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  </SidebarMenu>
                </CollapsibleContent>
              </Collapsible>

              {/* Projects Section */}
              <Collapsible
                defaultOpen={
                  currentView === "projects" || currentView === "projectRules"
                }
              >
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <CollapsibleTrigger className="flex items-center justify-between w-full">
                      <div className="flex items-center">
                        <Briefcase
                          className={cn(
                            "h-4 w-4 mr-2",
                            (currentView === "projects" ||
                              currentView === "projectRules") &&
                              "text-primary"
                          )}
                        />
                        <span>Projects</span>
                      </div>
                      <ChevronRight className="h-4 w-4 transition-transform group-data-[state=open]/collapsible:rotate-90" />
                    </CollapsibleTrigger>
                  </SidebarMenuButton>
                </SidebarMenuItem>

                <CollapsibleContent>
                  <SidebarMenu className="pl-4">
                    <SidebarMenuItem>
                      <SidebarMenuButton
                        asChild
                        isActive={currentView === "projects"}
                        onClick={() => onNavigation("projects")}
                        className={cn(
                          "cursor-pointer transition-all relative",
                          "hover:bg-accent",
                          currentView === "projects" && ["!bg-accent"]
                        )}
                      >
                        <div className="flex items-center">
                          <Briefcase
                            className={cn(
                              "h-4 w-4 mr-2",
                              currentView === "projects" && "text-primary"
                            )}
                          />
                          <span>Project Data</span>
                        </div>
                      </SidebarMenuButton>
                    </SidebarMenuItem>

                    <SidebarMenuItem>
                      <SidebarMenuButton
                        asChild
                        isActive={currentView === "projectRules"}
                        onClick={() => onNavigation("projectRules")}
                        className={cn(
                          "cursor-pointer transition-all relative",
                          "hover:bg-accent",
                          currentView === "projectRules" && ["!bg-accent"]
                        )}
                      >
                        <div className="flex items-center">
                          <ClipboardList
                            className={cn(
                              "h-4 w-4 mr-2",
                              currentView === "projectRules" && "text-primary"
                            )}
                          />
                          <span>Project Rules</span>
                        </div>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  </SidebarMenu>
                </CollapsibleContent>
              </Collapsible>

              {/* Contracts - Now a standalone menu item */}
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={currentView === "contracts"}
                  onClick={() => onNavigation("contracts")}
                  className={cn(
                    "cursor-pointer transition-all relative",
                    "hover:bg-accent",
                    currentView === "contracts" && ["!bg-gray-500"]
                  )}
                >
                  <div className="flex items-center">
                    <FileText className="h-4 w-4 mr-2" />
                    <span>Contracts</span>
                  </div>
                </SidebarMenuButton>
              </SidebarMenuItem>

              {/* Purchase Orders Section */}
              <Collapsible
                defaultOpen={
                  currentView === "purchaseOrders" || currentView === "poRules"
                }
              >
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <CollapsibleTrigger className="flex items-center justify-between w-full">
                      <div className="flex items-center">
                        <Receipt
                          className={cn(
                            "h-4 w-4 mr-2",
                            (currentView === "purchaseOrders" ||
                              currentView === "poRules") &&
                              "text-primary"
                          )}
                        />
                        <span>Purchase Orders</span>
                      </div>
                      <ChevronRight className="h-4 w-4 transition-transform group-data-[state=open]/collapsible:rotate-90" />
                    </CollapsibleTrigger>
                  </SidebarMenuButton>
                </SidebarMenuItem>

                <CollapsibleContent>
                  <SidebarMenu className="pl-4">
                    <SidebarMenuItem>
                      <SidebarMenuButton
                        asChild
                        isActive={currentView === "purchaseOrders"}
                        onClick={() => onNavigation("purchaseOrders")}
                        className={cn(
                          "cursor-pointer transition-all relative",
                          "hover:bg-accent",
                          currentView === "purchaseOrders" && ["!bg-accent"]
                        )}
                      >
                        <div className="flex items-center">
                          <Receipt
                            className={cn(
                              "h-4 w-4 mr-2",
                              currentView === "purchaseOrders" && "text-primary"
                            )}
                          />
                          <span>PO Data</span>
                        </div>
                      </SidebarMenuButton>
                    </SidebarMenuItem>

                    <SidebarMenuItem>
                      <SidebarMenuButton
                        asChild
                        isActive={currentView === "poRules"}
                        onClick={() => onNavigation("poRules")}
                        className={cn(
                          "cursor-pointer transition-all relative",
                          "hover:bg-accent",
                          currentView === "poRules" && ["!bg-accent"]
                        )}
                      >
                        <div className="flex items-center">
                          <ClipboardCheck
                            className={cn(
                              "h-4 w-4 mr-2",
                              currentView === "poRules" && "text-primary"
                            )}
                          />
                          <span>PO Rules</span>
                        </div>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  </SidebarMenu>
                </CollapsibleContent>
              </Collapsible>

              {/* Call-off Work Orders Section */}
              <Collapsible
                defaultOpen={
                  currentView === "calloffWorkOrders" ||
                  currentView === "cwoRules"
                }
              >
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <CollapsibleTrigger className="flex items-center justify-between w-full">
                      <div className="flex items-center">
                        <FileSpreadsheet
                          className={cn(
                            "h-4 w-4 mr-2",
                            (currentView === "calloffWorkOrders" ||
                              currentView === "cwoRules") &&
                              "text-primary"
                          )}
                        />
                        <span>Call-off Work Orders</span>
                      </div>
                      <ChevronRight className="h-4 w-4 transition-transform group-data-[state=open]/collapsible:rotate-90" />
                    </CollapsibleTrigger>
                  </SidebarMenuButton>
                </SidebarMenuItem>

                <CollapsibleContent>
                  <SidebarMenu className="pl-4">
                    <SidebarMenuItem>
                      <SidebarMenuButton
                        asChild
                        isActive={currentView === "calloffWorkOrders"}
                        onClick={() => onNavigation("calloffWorkOrders")}
                        className={cn(
                          "cursor-pointer transition-all relative",
                          "hover:bg-accent",
                          currentView === "calloffWorkOrders" && ["!bg-accent"]
                        )}
                      >
                        <div className="flex items-center">
                          <FileSpreadsheet
                            className={cn(
                              "h-4 w-4 mr-2",
                              currentView === "calloffWorkOrders" &&
                                "text-primary"
                            )}
                          />
                          <span>CWO Data</span>
                        </div>
                      </SidebarMenuButton>
                    </SidebarMenuItem>

                    <SidebarMenuItem>
                      <SidebarMenuButton
                        asChild
                        isActive={currentView === "cwoRules"}
                        onClick={() => onNavigation("cwoRules")}
                        className={cn(
                          "cursor-pointer transition-all relative",
                          "hover:bg-accent",
                          currentView === "cwoRules" && ["!bg-accent"]
                        )}
                      >
                        <div className="flex items-center">
                          <ScrollText
                            className={cn(
                              "h-4 w-4 mr-2",
                              currentView === "cwoRules" && "text-primary"
                            )}
                          />
                          <span>CWO Rules</span>
                        </div>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  </SidebarMenu>
                </CollapsibleContent>
              </Collapsible>

              {/* Expenses Section */}
              <Collapsible
                defaultOpen={
                  currentView === "expenses" ||
                  currentView === "expenseValidationRules"
                }
              >
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <CollapsibleTrigger className="flex items-center justify-between w-full">
                      <div className="flex items-center">
                        <DollarSign
                          className={cn(
                            "h-4 w-4 mr-2",
                            (currentView === "expenses" ||
                              currentView === "expenseValidationRules") &&
                              "text-primary"
                          )}
                        />
                        <span>Expenses</span>
                      </div>
                      <ChevronRight className="h-4 w-4 transition-transform group-data-[state=open]/collapsible:rotate-90" />
                    </CollapsibleTrigger>
                  </SidebarMenuButton>
                </SidebarMenuItem>

                <CollapsibleContent>
                  <SidebarMenu className="pl-4">
                    <SidebarMenuItem>
                      <SidebarMenuButton
                        asChild
                        isActive={currentView === "expenses"}
                        onClick={() => onNavigation("expenses")}
                        className={cn(
                          "cursor-pointer transition-all relative",
                          "hover:bg-accent",
                          currentView === "expenses" && ["!bg-accent"]
                        )}
                      >
                        <div className="flex items-center">
                          <DollarSign
                            className={cn(
                              "h-4 w-4 mr-2",
                              currentView === "expenses" && "text-primary"
                            )}
                          />
                          <span>Expense Data</span>
                        </div>
                      </SidebarMenuButton>
                    </SidebarMenuItem>

                    <SidebarMenuItem>
                      <SidebarMenuButton
                        asChild
                        isActive={currentView === "expenseValidationRules"}
                        onClick={() => onNavigation("expenseValidationRules")}
                        className={cn(
                          "cursor-pointer transition-all relative",
                          "hover:bg-accent",
                          currentView === "expenseValidationRules" && [
                            "!bg-accent",
                          ]
                        )}
                      >
                        <div className="flex items-center">
                          <ClipboardEdit
                            className={cn(
                              "h-4 w-4 mr-2",
                              currentView === "expenseValidationRules" &&
                                "text-primary"
                            )}
                          />
                          <span>Expense Rules</span>
                        </div>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  </SidebarMenu>
                </CollapsibleContent>
              </Collapsible>

              {/* Invoices Section */}
              <Collapsible
                defaultOpen={
                  currentView === "invoices" ||
                  currentView === "invoiceFormattingRules"
                }
              >
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <CollapsibleTrigger className="flex items-center justify-between w-full">
                      <div className="flex items-center">
                        <FileCheck
                          className={cn(
                            "h-4 w-4 mr-2",
                            (currentView === "invoices" ||
                              currentView === "invoiceFormattingRules") &&
                              "text-primary"
                          )}
                        />
                        <span>Invoices</span>
                      </div>
                      <ChevronRight className="h-4 w-4 transition-transform group-data-[state=open]/collapsible:rotate-90" />
                    </CollapsibleTrigger>
                  </SidebarMenuButton>
                </SidebarMenuItem>

                <CollapsibleContent>
                  <SidebarMenu className="pl-4">
                    <SidebarMenuItem>
                      <SidebarMenuButton
                        asChild
                        isActive={currentView === "invoices"}
                        onClick={() => onNavigation("invoices")}
                        className={cn(
                          "cursor-pointer transition-all relative",
                          "hover:bg-accent",
                          currentView === "invoices" && ["!bg-accent"]
                        )}
                      >
                        <div className="flex items-center">
                          <FileCheck
                            className={cn(
                              "h-4 w-4 mr-2",
                              currentView === "invoices" && "text-primary"
                            )}
                          />
                          <span>Invoice Data</span>
                        </div>
                      </SidebarMenuButton>
                    </SidebarMenuItem>

                    <SidebarMenuItem>
                      <SidebarMenuButton
                        asChild
                        isActive={currentView === "invoiceFormattingRules"}
                        onClick={() => onNavigation("invoiceFormattingRules")}
                        className={cn(
                          "cursor-pointer transition-all relative",
                          "hover:bg-accent",
                          currentView === "invoiceFormattingRules" && [
                            "!bg-accent",
                          ]
                        )}
                      >
                        <div className="flex items-center">
                          <FileOutput
                            className={cn(
                              "h-4 w-4 mr-2",
                              currentView === "invoiceFormattingRules" &&
                                "text-primary"
                            )}
                          />
                          <span>Invoice Rules</span>
                        </div>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  </SidebarMenu>
                </CollapsibleContent>
              </Collapsible>

              {/* Rates - Add as a standalone menu item */}
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={currentView === "rates"}
                  onClick={() => onNavigation("rates")}
                  className={cn(
                    "cursor-pointer transition-all relative",
                    "hover:bg-accent",
                    currentView === "rates" && ["!bg-gray-500"]
                  )}
                >
                  <div className="flex items-center">
                    <ArrowDownUp className="h-4 w-4 mr-2" />
                    <span>Rates</span>
                  </div>
                </SidebarMenuButton>
              </SidebarMenuItem>

              {/* New Submissions Section */}
              <Collapsible
                defaultOpen={
                  currentView === "submissions" ||
                  currentView === "submissionValidationRules" ||
                  currentView === "reviews"
                }
              >
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <CollapsibleTrigger className="flex items-center justify-between w-full">
                      <div className="flex items-center">
                        <FileOutput
                          className={cn(
                            "h-4 w-4 mr-2",
                            (currentView === "submissions" ||
                              currentView === "submissionValidationRules" ||
                              currentView === "reviews") &&
                              "text-primary"
                          )}
                        />
                        <span>Submissions</span>
                      </div>
                      <ChevronRight className="h-4 w-4 transition-transform group-data-[state=open]/collapsible:rotate-90" />
                    </CollapsibleTrigger>
                  </SidebarMenuButton>
                </SidebarMenuItem>

                <CollapsibleContent>
                  <SidebarMenu className="pl-4">
                    <SidebarMenuItem>
                      <SidebarMenuButton
                        asChild
                        isActive={currentView === "submissions"}
                        onClick={() => onNavigation("submissions")}
                        className={cn(
                          "cursor-pointer transition-all relative",
                          "hover:bg-accent",
                          currentView === "submissions" && ["!bg-accent"]
                        )}
                      >
                        <div className="flex items-center">
                          <FileOutput
                            className={cn(
                              "h-4 w-4 mr-2",
                              currentView === "submissions" && "text-primary"
                            )}
                          />
                          <span>Submission Data</span>
                        </div>
                      </SidebarMenuButton>
                    </SidebarMenuItem>

                    <SidebarMenuItem>
                      <SidebarMenuButton
                        asChild
                        isActive={currentView === "submissionValidationRules"}
                        onClick={() =>
                          onNavigation("submissionValidationRules")
                        }
                        className={cn(
                          "cursor-pointer transition-all relative",
                          "hover:bg-accent",
                          currentView === "submissionValidationRules" && [
                            "!bg-accent",
                          ]
                        )}
                      >
                        <div className="flex items-center">
                          <ClipboardCheck
                            className={cn(
                              "h-4 w-4 mr-2",
                              currentView === "submissionValidationRules" &&
                                "text-primary"
                            )}
                          />
                          <span>Validation Rules</span>
                        </div>
                      </SidebarMenuButton>
                    </SidebarMenuItem>

                    <SidebarMenuItem>
                      <SidebarMenuButton
                        asChild
                        isActive={currentView === "reviews"}
                        onClick={() => onNavigation("reviews")}
                        className={cn(
                          "cursor-pointer transition-all relative",
                          "hover:bg-accent",
                          currentView === "reviews" && ["!bg-accent"]
                        )}
                      >
                        <div className="flex items-center">
                          <ScrollText
                            className={cn(
                              "h-4 w-4 mr-2",
                              currentView === "reviews" && "text-primary"
                            )}
                          />
                          <span>Reviews</span>
                        </div>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  </SidebarMenu>
                </CollapsibleContent>
              </Collapsible>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
