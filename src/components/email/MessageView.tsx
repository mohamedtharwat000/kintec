import { useMessage } from "@/hooks/useMailApi";
import { Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface MessageViewProps {
  mailboxPath: string | null;
  messageUid: number | null;
  onClose: () => void;
}

export function MessageView({
  mailboxPath,
  messageUid,
  onClose,
}: MessageViewProps) {
  const { data: message, isLoading } = useMessage(mailboxPath, messageUid);

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  if (!message) {
    return null;
  }

  return (
    <div className="h-full flex flex-col">
      <div className="border-b p-4 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">{message.envelope.subject}</h2>
          <p className="text-sm text-muted-foreground">
            From:{" "}
            {message.envelope.from?.[0]?.name ||
              message.envelope.from?.[0]?.address}
          </p>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>
      <div className="flex-1 p-4 overflow-auto">
        {message.parsed?.html ? (
          <div
            className="prose max-w-none"
            dangerouslySetInnerHTML={{ __html: message.parsed.html }}
          />
        ) : message.parsed?.text ? (
          <pre className="whitespace-pre-wrap font-sans">
            {message.parsed.text}
          </pre>
        ) : (
          <pre className="whitespace-pre-wrap font-sans">
            {message.source
              ? Buffer.from(message.source).toString("utf-8")
              : "No content available"}
          </pre>
        )}

        {Array.isArray(message.parsed?.attachments) &&
          message.parsed.attachments.length > 0 && (
            <div className="mt-4 border-t pt-4">
              <h3 className="font-semibold mb-2">Attachments:</h3>
              <div className="space-y-2">
                {message.parsed.attachments.map((attachment, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <span>{attachment.filename}</span>
                    {/* Add attachment handling as needed */}
                  </div>
                ))}
              </div>
            </div>
          )}
      </div>
    </div>
  );
}
