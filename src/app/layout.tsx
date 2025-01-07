import "~/styles/globals.css";

import { GeistSans } from "geist/font/sans";
import { type Metadata } from "next";
import type { ReactNode } from "react";
import { ContextProviders } from "~/context/ContextProviders";
import { Toaster } from "~/components/ui/toaster";

export const metadata: Metadata = {
  title: "School dashboard",
  description: "Built for the schools of tomorrow",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

export default function RootLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en" className={`${GeistSans.variable}`}>
      <body>
        <ContextProviders>
          {children}
          <Toaster />
        </ContextProviders>
      </body>
    </html>
  );
}
