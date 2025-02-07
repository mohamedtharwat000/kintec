import { NextRequest, NextResponse } from "next/server";
import { IMAPWorker } from "@/lib/imap";
import { getServerInfo } from "@/lib/auth";
import { handleApiError } from "@/lib/api-utils";

export async function GET(
  req: NextRequest,
  { params }: { params: { mailbox: string; uid: string } }
) {
  try {
    const mailbox = decodeURIComponent(params.mailbox);
    const uid = parseInt(params.uid);

    if (!mailbox || isNaN(uid)) {
      return NextResponse.json(
        { success: false, error: "Invalid mailbox or message ID" },
        { status: 400 }
      );
    }

    const serverInfo = await getServerInfo();
    const worker = await IMAPWorker.getInstance(serverInfo);
    const message = await worker.getMessage(mailbox, uid);

    return NextResponse.json({ success: true, message });
  } catch (error) {
    return handleApiError(error, "Failed to fetch message");
  }
}
