import type { Metadata } from "next";
import "./globals.css";
import { ClientLayout } from "./client-layout";

export const metadata: Metadata = {
  title: "NexusSLA — Autonomous SLA Dispute Court",
  description:
    "NexusSLA turns real-world service evidence into verifiable on-chain SLA decisions using GenLayer's intelligent contract consensus. The autonomous court for the agentic internet.",
  keywords: ["SLA", "GenLayer", "Intelligent Contract", "Web3", "Dispute Court", "Oracle"],
  icons: {
    icon: "/logo.png",
    shortcut: "/logo.png",
    apple: "/logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
