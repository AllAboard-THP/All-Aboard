import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "All-Aboard",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body style={{ margin: 0 }}>{children}</body>
    </html>
  );
}
