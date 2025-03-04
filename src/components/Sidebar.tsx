"use client";

import * as React from "react";
import { Building2, Users, FileText, Briefcase } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

interface SidebarProps {
  currentView: "contractors" | "companies" | "contracts";
  onNavigation: (view: "contractors" | "companies" | "contracts") => void;
}

export function AppSidebar({ currentView, onNavigation }: SidebarProps) {
  return (
    <Sidebar className="top-[--header-height] !h-[calc(100svh-var(--header-height))] w-[270px] border-r md:translate-x-0 md:static absolute z-40 bg-background">
      <SidebarContent className="p-2">
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={currentView === "contractors"}
                  onClick={() => onNavigation("contractors")}
                  className={cn(
                    "cursor-pointer transition-all relative",
                    "hover:bg-gray-100 dark:hover:bg-gray-800/40",
                    currentView === "contractors" && [
                      "bg-gray-200 dark:bg-gray-800 font-medium text-primary",
                    ]
                  )}
                >
                  <div className="flex items-center">
                    <Users
                      className={cn(
                        "h-4 w-4 mr-2",
                        currentView === "contractors" && "text-primary"
                      )}
                    />
                    <span>Contractors</span>
                  </div>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={currentView === "companies"}
                  onClick={() => onNavigation("companies")}
                  className={cn(
                    "cursor-pointer transition-all relative",
                    "hover:bg-gray-100 dark:hover:bg-gray-800/40",
                    currentView === "companies" && [
                      "bg-gray-200 dark:bg-gray-800 font-medium text-primary",
                    ]
                  )}
                >
                  <div className="flex items-center">
                    <Building2
                      className={cn(
                        "h-4 w-4 mr-2",
                        currentView === "companies" && "text-primary"
                      )}
                    />
                    <span>Companies</span>
                  </div>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={currentView === "contracts"}
                  onClick={() => onNavigation("contracts")}
                  className={cn(
                    "cursor-pointer transition-all relative",
                    "hover:bg-gray-100 dark:hover:bg-gray-800/40",
                    currentView === "contracts" && [
                      "bg-gray-200 dark:bg-gray-800 font-medium text-primary",
                    ]
                  )}
                >
                  <div className="flex items-center">
                    <FileText
                      className={cn(
                        "h-4 w-4 mr-2",
                        currentView === "contracts" && "text-primary"
                      )}
                    />
                    <span>Contracts</span>
                  </div>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
