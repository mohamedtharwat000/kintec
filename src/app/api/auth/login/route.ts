import { NextRequest, NextResponse } from "next/server";
import { ServerInfo } from "@/types/server";
import { IMAPWorker } from "@/lib/imap";
import { setServerInfo } from "@/lib/auth";
import { handleApiError } from "@/lib/api-utils";
import { detectEmailProvider } from "@/lib/email-utils";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { email, password } = body;

  if (!email || !password) {
    return NextResponse.json(
      { success: false, message: "Missing required credentials" },
      { status: 400 }
    );
  }

  try {
    const { provider, serverConfig } = await detectEmailProvider(email);

    if (!provider || !serverConfig) {
      return NextResponse.json(
        { success: false, message: "Unsupported email provider" },
        { status: 400 }
      );
    }

    const serverInfo: ServerInfo = {
      host: serverConfig.host,
      port: serverConfig.port,
      secure: true,
      auth: { user: email, pass: password },
    };

    await IMAPWorker.getInstance(serverInfo);

    await setServerInfo(serverInfo);

    return NextResponse.json({
      success: true,
      message: "Successfully connected to email server",
      user: {
        email,
        provider,
        host: serverConfig.host,
        port: serverConfig.port,
      },
    });
  } catch (error) {
    return handleApiError(error, "Authentication failed");
  }
}
