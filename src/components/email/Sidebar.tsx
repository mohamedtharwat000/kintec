import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Mail, Users, FileText, Loader2 } from "lucide-react";
import { MailboxObject } from "imapflow";
import { useMailboxes } from "@/hooks/useMailApi";

interface SidebarProps {
  selectedMailbox: string;
  currentView: "mail" | "invoices" | "clients";
  onMailboxSelect: (mailbox: MailboxObject) => void;
  onNavigation: (view: "invoices" | "clients") => void;
}

export function Sidebar({
  selectedMailbox,
  currentView,
  onMailboxSelect,
  onNavigation,
}: SidebarProps) {
  const { data: mailboxes = [], isLoading: loadingMailboxes } = useMailboxes();

  return (
    <div className="p-4 space-y-4">
      <div className="space-y-1">
        <Button
          variant={currentView === "invoices" ? "secondary" : "ghost"}
          className="w-full justify-start"
          onClick={() => onNavigation("invoices")}
        >
          <FileText className="mr-2 h-4 w-4" />
          <span>Invoices</span>
        </Button>
        <Button
          variant={currentView === "clients" ? "secondary" : "ghost"}
          className="w-full justify-start"
          onClick={() => onNavigation("clients")}
        >
          <Users className="mr-2 h-4 w-4" />
          <span>Clients</span>
        </Button>
      </div>

      <h2 className="font-semibold text-lg px-2">Mailboxes</h2>
      {loadingMailboxes ? (
        <div className="flex justify-center">
          <Loader2 className="h-4 w-4 animate-spin" />
        </div>
      ) : (
        <ScrollArea className="h-[calc(100vh-8rem)]">
          <div className="space-y-1">
            {mailboxes?.map((mailbox) => (
              <Button
                key={mailbox.path}
                variant={
                  selectedMailbox === mailbox.path ? "secondary" : "ghost"
                }
                className="w-full justify-start"
                onClick={() => onMailboxSelect(mailbox)}
              >
                <Mail className="mr-2 h-4 w-4" />
                <span className="truncate">
                  {mailbox.path.startsWith("[Gmail]")
                    ? mailbox.path.replace("[Gmail]/", "")
                    : mailbox.path}
                </span>
              </Button>
            ))}
          </div>
        </ScrollArea>
      )}
    </div>
  );
}
