"use client";

import { useState } from "react";
import { useMailboxMessages } from "@/hooks/useMailApi";
import { MessageList } from "@/components/email/MessageList";
import { MessageView } from "@/components/email/MessageView";

export function EmailClient() {
  const [selectedMailbox] = useState("[Gmail]/All Mail");
  const [selectedMessage, setSelectedMessage] = useState<number | null>(null);
  const [page, setPage] = useState(1);

  const { data: messagesData, isLoading: loadingMessages } = useMailboxMessages(
    selectedMailbox,
    page
  );

  const onPageChange = (newPage: number) => setPage(newPage);
  const onMessageSelect = (uid: number) => setSelectedMessage(uid);
  const onCloseMessage = () => setSelectedMessage(null);

  return (
    <div className="flex-1 bg-background">
      {!selectedMessage ? (
        <MessageList
          loading={loadingMessages}
          messages={messagesData?.messages || []}
          page={page}
          totalPages={messagesData?.totalPages || 1}
          onPageChange={onPageChange}
          onMessageSelect={onMessageSelect}
        />
      ) : (
        <MessageView
          mailboxPath={selectedMailbox}
          messageUid={selectedMessage}
          onClose={onCloseMessage}
        />
      )}
    </div>
  );
}
