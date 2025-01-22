import { NextResponse } from "next/server";
import { IMAPWorker } from "@/lib/imap";
import { getServerInfo } from "@/lib/auth";
import { handleApiError } from "@/lib/api-utils";

export async function GET() {
  try {
    const serverInfo = await getServerInfo();

    const worker = await IMAPWorker.getInstance(serverInfo);

    const imapMailboxes = await worker.listMailboxes();

    return NextResponse.json({ success: true, imapMailboxes });
  } catch (error) {
    return handleApiError(error, "Failed to list mailboxes");
  }
}
