"use client";

import { type PropsWithChildren, useState } from "react";
import { AuthProvider } from "~/context/auth/AuthContext";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

export function ContextProviders({ children }: PropsWithChildren) {
  // Create a new QueryClient instance for each user session
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000, // Data becomes stale after 1 minute
            gcTime: 5 * 60 * 1000, // Unused data is garbage collected after 5 minutes
            refetchOnWindowFocus: true, // Refetch when window regains focus
            retry: 1, // Only retry failed requests once
          },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>{children}</AuthProvider>
      <ReactQueryDevtools initialIsOpen={false} /> {/* Development tools */}
    </QueryClientProvider>
  );
}
