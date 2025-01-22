"use server";
import dns from "dns";
import { promisify } from "util";

const resolveMx = promisify(dns.resolveMx);

const PROVIDER_PATTERNS = {
  google: /(google|gmail|googlemail)/i,
  microsoft: /(outlook|hotmail|microsoft|office365)/i,
};

export const getServerConfig = async (provider: string) => {
  const configs = {
    google: {
      host: "imap.gmail.com",
      port: 993,
    },
    microsoft: {
      host: "outlook.office365.com",
      port: 993,
    },
  };

  return configs[provider as keyof typeof configs] || null;
};

export async function detectEmailProvider(email: string) {
  const domain = email.split("@")[1];
  const mxRecords = await resolveMx(domain);

  mxRecords.sort((a, b) => a.priority - b.priority);
  const primaryMx = mxRecords[0]?.exchange.toLowerCase();

  let provider = "unknown";
  for (const [key, pattern] of Object.entries(PROVIDER_PATTERNS)) {
    if (pattern.test(primaryMx)) {
      provider = key;
      break;
    }
  }

  return {
    provider,
    serverConfig: await getServerConfig(provider),
  };
}
