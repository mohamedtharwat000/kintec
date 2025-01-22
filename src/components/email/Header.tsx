"use client";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { LogOut, Mail } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useRouter } from "next/navigation";

export function Header() {
  const { logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.refresh();
  };

  return (
    <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="h-16 flex items-center justify-between px-6">
        <div className="flex items-center gap-3">
          <div className="bg-primary/10 p-2 rounded-lg">
            <Mail className="h-5 w-5 text-primary" />
          </div>
          <h1 className="text-xl font-semibold tracking-tight">Kintec Mail</h1>
        </div>

        <div className="flex items-center gap-4">
          <ThemeToggle />
          <Button
            variant="outline"
            onClick={handleLogout}
            className="flex items-center gap-2 hover:bg-destructive hover:text-destructive-foreground transition-colors"
          >
            <LogOut className="h-4 w-4" />
            <span>Logout</span>
          </Button>
        </div>
      </div>
    </header>
  );
}
