import type { Metadata, Viewport } from "next";
import "katex/dist/katex.min.css";
import "./globals.css";
import { AppShell } from "@/components/AppShell";

export const metadata: Metadata = {
  title: { default: "Mathematics Command Center", template: "%s · MCC" },
  description: "Learn mathematics from counting to AI mathematics with visual explanations, working simulations, real practice and a university Academy Path.",
};

export const viewport: Viewport = { themeColor: "#0B0D12", width: "device-width", initialScale: 1 };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-theme="dark" suppressHydrationWarning>
      <body>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
