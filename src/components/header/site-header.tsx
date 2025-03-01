"use client";

import { Command, SidebarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/header/theme-toggle";
import { UserNav } from "@/components/header/user-nav";
import { useSidebar } from "@/components/ui/sidebar";

interface SiteHeaderProps {
  showUserNav?: boolean;
}

export function SiteHeader({ showUserNav = true }: SiteHeaderProps) {
  const { toggleSidebar, isSidebarOpen } = useSidebar();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background">
      <div className="flex h-[--header-height] w-full items-center">
        {/* Sidebar width matching area for branding */}
        <div className="flex w-[270px] min-w-[270px] items-center gap-2 border-r px-4 h-full md:pl-6">
          <Button
            className="h-8 w-8 md:hidden"
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
            aria-label={isSidebarOpen ? "Close sidebar" : "Open sidebar"}
          >
            <SidebarIcon className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-2">
            <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Command className="size-4" />
            </div>
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-semibold">Kintec System</span>
            </div>
          </div>
        </div>

        {/* Main header content */}
        <div className="flex flex-1 items-center justify-end px-4">
          <div className="flex items-center space-x-2">
            <ThemeToggle />
            {showUserNav && <UserNav />}
          </div>
        </div>
      </div>
    </header>
  );
}
