"use client";

import { Toaster } from "@allaboard/ui/components/sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());
  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <Toaster theme="dark" />
    </QueryClientProvider>
  );
}
