import type { Metadata } from "next";

import { AppShell } from "@/components/app-shell";
import { CguGate } from "@/components/cgu-gate";
import { Providers } from "./providers";

import "./globals.css";

export const metadata: Metadata = {
  title: "All-Aboard",
  description: "Plateforme d'entraide entre étudiants",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className="dark" suppressHydrationWarning>
      <body>
        <Providers>
          <CguGate>
            <AppShell>{children}</AppShell>
          </CguGate>
        </Providers>
      </body>
    </html>
  );
}
