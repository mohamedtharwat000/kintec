import type { Metadata } from "next";
import "@/style/index.css";
import { Providers } from "@/components/Providers";

export const metadata: Metadata = {
  title: "Kintec Mail",
  description: "View Kintec Mails",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-background font-sans antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
