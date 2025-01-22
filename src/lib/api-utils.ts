import { NextResponse } from "next/server";

export function handleApiError(error: unknown, defaultMessage: string) {
  const message = error instanceof Error ? error.message : defaultMessage;
  return NextResponse.json({ success: false, message }, { status: 500 });
}
