import { Button } from "@/components/ui/button";
import { Mail, Users, UserSquare2, FileText } from "lucide-react";
import { MailboxObject } from "imapflow";
import { useMailboxes } from "@/hooks/useMailApi";

interface SidebarProps {
  selectedMailbox: string;
  currentView: "mail" | "clients" | "employees" | "invoices";
  onMailboxSelect: (mailbox: MailboxObject) => void;
  onNavigation: (view: "clients" | "employees" | "invoices") => void;
}

export function Sidebar({
  selectedMailbox,
  currentView,
  onMailboxSelect,
  onNavigation,
}: SidebarProps) {
  const { data: mailboxes = [] } = useMailboxes();
  const allMail = mailboxes[0];

  return (
    <div className="p-4 space-y-4">
      <div className="space-y-1">
        {allMail && (
          <Button
            variant={selectedMailbox === allMail.path ? "secondary" : "ghost"}
            className="w-full justify-start"
            onClick={() => onMailboxSelect(allMail)}
          >
            <Mail className="mr-2 h-4 w-4" />
            <span>All Mail</span>
          </Button>
        )}
        <Button
          variant={currentView === "clients" ? "secondary" : "ghost"}
          className="w-full justify-start"
          onClick={() => onNavigation("clients")}
        >
          <Users className="mr-2 h-4 w-4" />
          <span>Clients</span>
        </Button>
        <Button
          variant={currentView === "employees" ? "secondary" : "ghost"}
          className="w-full justify-start"
          onClick={() => onNavigation("employees")}
        >
          <UserSquare2 className="mr-2 h-4 w-4" />
          <span>Contractors</span>
        </Button>
        <Button
          variant={currentView === "invoices" ? "secondary" : "ghost"}
          className="w-full justify-start"
          onClick={() => onNavigation("invoices")}
        >
          <FileText className="mr-2 h-4 w-4" />
          <span>Invoices</span>
        </Button>
      </div>
    </div>
  );
}
