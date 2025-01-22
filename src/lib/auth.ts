"use server";

import { cookies } from "next/headers";
import { getIronSession } from "iron-session";
import { ServerInfo } from "@/types/server";

const sessionOptions = {
  cookieName: "email-client-session",
  password: process.env.SESSION_SECRET!,
};

export async function getServerInfo(): Promise<ServerInfo> {
  const sessionCookies = await cookies();
  const session = await getIronSession<ServerInfo>(
    sessionCookies,
    sessionOptions
  );

  if (!session.host || !session.port || !session.auth?.user) {
    throw new Error("Not authenticated");
  }

  return {
    host: session.host,
    port: session.port,
    auth: session.auth,
  };
}

export async function setServerInfo(serverInfo: ServerInfo) {
  const sessionCookies = await cookies();
  const session = await getIronSession<ServerInfo>(
    sessionCookies,
    sessionOptions
  );

  session.host = serverInfo.host;
  session.port = serverInfo.port;
  session.auth = serverInfo.auth;

  await session.save();
}
