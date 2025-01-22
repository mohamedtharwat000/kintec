import type { Metadata } from "next";
import "@/style/index.css";

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
      <body>{children}</body>
    </html>
  );
}
