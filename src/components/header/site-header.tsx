"use client";

import { Command } from "lucide-react";
import { ThemeToggle } from "@/components/header/theme-toggle";
import { UserNav } from "@/components/header/user-nav";

interface SiteHeaderProps {
  showUserNav?: boolean;
}

export function SiteHeader({ showUserNav = true }: SiteHeaderProps) {
  return (
    <header className="flex items-center w-full gap-2 p-2 border-b h-16">
      {/* Sidebar width matching area for branding */}
      <div className="flex items-center gap-2">
        <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <Command className="size-4" />
        </div>
        <div className="grid flex-1 text-left text-sm leading-tight">
          <span className="truncate font-semibold">Kintec System</span>
        </div>
      </div>

      {/* Main header content */}
      <div className="flex flex-1 items-center justify-end px-4">
        <div className="flex items-center space-x-2">
          <ThemeToggle />
          {showUserNav && <UserNav />}
        </div>
      </div>
    </header>
  );
}
