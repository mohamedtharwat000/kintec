import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import type { CustomMessageObject } from "@/types/email";

interface MessageListProps {
  loading: boolean;
  messages: CustomMessageObject[];
  page: number;
  totalPages: number;
  onPageChange: (newPage: number) => void;
  onMessageSelect: (uid: number) => void;
}

export function MessageList({
  loading,
  messages,
  page,
  totalPages,
  onPageChange,
  onMessageSelect,
}: MessageListProps) {
  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <ScrollArea className="flex-1">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>From</TableHead>
              <TableHead>Subject</TableHead>
              <TableHead>Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {messages.map((message) => (
              <TableRow
                key={message.uid}
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => onMessageSelect(message.uid)}
              >
                <TableCell>
                  {message.envelope.from?.[0]?.name ||
                    message.envelope.from?.[0]?.address}
                </TableCell>
                <TableCell>{message.envelope.subject}</TableCell>
                <TableCell>
                  {new Date(message.envelope.date).toLocaleDateString()}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </ScrollArea>
      <div className="p-4 flex items-center justify-center gap-2">
        <Button
          variant="outline"
          size="icon"
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <span className="text-sm">
          Page {page} of {totalPages}
        </span>
        <Button
          variant="outline"
          size="icon"
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
