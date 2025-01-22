import { NextRequest, NextResponse } from "next/server";
import { IMAPWorker } from "@/lib/imap";
import { getServerInfo } from "@/lib/auth";
import { handleApiError } from "@/lib/api-utils";

export async function GET(
  req: NextRequest,
  { params }: { params: { mailbox: string } }
) {
  try {
    const searchParams = new URL(req.url).searchParams;
    const page = parseInt(searchParams.get("page") || "1");
    const pageSize = parseInt(searchParams.get("pageSize") || "10");
    const mailbox = decodeURIComponent(params.mailbox);

    if (!mailbox) {
      return NextResponse.json(
        { success: false, error: "Mailbox path is required" },
        { status: 400 }
      );
    }

    const serverInfo = await getServerInfo();
    if (!serverInfo) {
      return NextResponse.json(
        { success: false, error: "Server configuration not found" },
        { status: 401 }
      );
    }

    const worker = await IMAPWorker.getInstance(serverInfo);
    const result = await worker.listMessages(mailbox, page, pageSize);

    if (!result || !result.messages) {
      return NextResponse.json(
        { success: false, error: "Failed to fetch messages" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      messages: result.messages,
      totalPages: result.totalPages,
      currentPage: page,
    });
  } catch (error) {
    return handleApiError(error, "Failed to list messages");
  }
}
