"use client";

import { type PropsWithChildren } from "react";
import { AuthProvider } from "~/context/auth/AuthContext";

export function ContextProviders({ children }: PropsWithChildren) {
  return <AuthProvider>{children}</AuthProvider>;
}
