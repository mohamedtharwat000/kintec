"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

type SidebarContextValue = {
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
  closeSidebar: () => void;
};

const SidebarContext = React.createContext<SidebarContextValue | undefined>(
  undefined
);

function useSidebar() {
  const context = React.useContext(SidebarContext);
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider");
  }
  return context;
}

type SidebarProviderProps = {
  children: React.ReactNode;
  className?: string;
};

function SidebarProvider({ children, className }: SidebarProviderProps) {
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);

  const toggleSidebar = React.useCallback(() => {
    setIsSidebarOpen((prev) => !prev);
  }, []);

  const closeSidebar = React.useCallback(() => {
    setIsSidebarOpen(false);
  }, []);

  // Close sidebar when screen size changes to desktop
  React.useEffect(() => {
    const mediaQuery = window.matchMedia("(min-width: 768px)");

    const handleChange = (e: MediaQueryListEvent) => {
      if (e.matches) {
        setIsSidebarOpen(false);
      }
    };

    mediaQuery.addEventListener("change", handleChange);

    return () => {
      mediaQuery.removeEventListener("change", handleChange);
    };
  }, []);

  return (
    <SidebarContext.Provider
      value={{ isSidebarOpen, toggleSidebar, closeSidebar }}
    >
      <div className={cn("relative", className)}>
        {children}
        {isSidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-30 md:hidden"
            onClick={closeSidebar}
            aria-hidden="true"
          />
        )}
      </div>
    </SidebarContext.Provider>
  );
}

type SidebarProps = React.HTMLAttributes<HTMLDivElement> & {
  className?: string;
};

function Sidebar({ className, ...props }: SidebarProps) {
  const { isSidebarOpen } = useSidebar();

  return (
    <aside
      className={cn(
        "transition-transform duration-300 ease-in-out",
        !isSidebarOpen && "-translate-x-full",
        className
      )}
      {...props}
    />
  );
}

function SidebarContent({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("overflow-auto", className)} {...props} />;
}

function SidebarInset({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("flex-1 overflow-auto", className)} {...props} />;
}

function SidebarGroup({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("space-y-2", className)} {...props} />;
}

function SidebarGroupLabel({
  className,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      className={cn(
        "px-2 text-xs font-medium tracking-tight text-muted-foreground",
        className
      )}
      {...props}
    />
  );
}

function SidebarGroupContent({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("space-y-1", className)} {...props} />;
}

function SidebarMenu({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("space-y-1", className)} {...props} />;
}

function SidebarMenuItem({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("", className)} {...props} />;
}

type SidebarMenuButtonProps = {
  asChild?: boolean;
  isActive?: boolean;
} & React.ButtonHTMLAttributes<HTMLButtonElement>;

function SidebarMenuButton({
  className,
  asChild,
  isActive,
  ...props
}: SidebarMenuButtonProps) {
  return (
    <button
      className={cn(
        "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors",
        isActive && "bg-accent text-accent-foreground",
        className
      )}
      {...props}
    />
  );
}

export {
  useSidebar,
  SidebarProvider,
  Sidebar,
  SidebarContent,
  SidebarInset,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
};
