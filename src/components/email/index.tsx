"use client";

import { useState } from "react";

import {
  ResizablePanel,
  ResizablePanelGroup,
  ResizableHandle,
} from "@/components/ui/resizable";
import { MailboxObject } from "imapflow";
import { Header } from "@/components/email/Header";
import { Footer } from "@/components/email/Footer";
import { Sidebar } from "@/components/email/Sidebar";
import { useMailboxMessages } from "@/hooks/useMailApi";
import { MessageList } from "@/components/email/MessageList";
import { Invoices } from "@/components/invoices";
import { Clients } from "@/components/clients";

type View = "mail" | "invoices" | "clients";

export function EmailClient() {
  const [currentView, setCurrentView] = useState<View>("mail");
  const [selectedMailbox, setSelectedMailbox] = useState<
    MailboxObject["path"] | null
  >("INBOX");
  const [page, setPage] = useState(1);

  const { data: messagesData, isLoading: loadingMessages } = useMailboxMessages(
    selectedMailbox,
    page
  );

  const handleNavigation = (view: View) => {
    setCurrentView(view);
    setSelectedMailbox(null);
  };

  const handleMailboxSelect = (mailbox: MailboxObject) => {
    setSelectedMailbox(mailbox.path);
    setCurrentView("mail");
    setPage(1);
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  return (
    <div className="h-screen flex flex-col bg-background">
      <Header />
      <ResizablePanelGroup direction="horizontal" className="flex-1">
        <ResizablePanel
          defaultSize={20}
          minSize={15}
          maxSize={30}
          className="border-r"
        >
          <Sidebar
            selectedMailbox={selectedMailbox ?? ""}
            currentView={currentView}
            onMailboxSelect={handleMailboxSelect}
            onNavigation={handleNavigation}
          />
        </ResizablePanel>
        <ResizableHandle />
        <ResizablePanel defaultSize={80}>
          {currentView === "mail" && (
            <MessageList
              loading={loadingMessages}
              messages={messagesData?.messages || []}
              page={page}
              totalPages={messagesData?.totalPages || 1}
              onPageChange={handlePageChange}
            />
          )}
          {currentView === "invoices" && <Invoices />}
          {currentView === "clients" && <Clients />}
        </ResizablePanel>
      </ResizablePanelGroup>
      <Footer />
    </div>
  );
}
