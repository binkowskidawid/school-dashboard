"use client";

import { type Admin } from "@prisma/client";
import type { PropsWithChildren } from "react";
import { createContext, useContext, useEffect, useState } from "react";
import { deleteCookie, getCookie, setCookie } from "cookies-next";
import { useToast } from "~/hooks/use-toast";
import { checkCredentials } from "~/utils/login/checkCredentials";

type AuthStatus = "loading" | "authenticated" | "unauthenticated";

type AuthContextProps = {
  admin: Admin | null;
  signIn: (credentials: {
    username: string;
    password: string;
  }) => Promise<void>;
  signOut: () => Promise<void>;
  status: AuthStatus;
};

const AuthContext = createContext<AuthContextProps>({
  admin: null,
  signIn: () => Promise.resolve(),
  signOut: () => Promise.resolve(),
  status: "loading",
});

export function AuthProvider({ children }: PropsWithChildren) {
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [status, setStatus] = useState<AuthStatus>("loading");

  const { toast } = useToast();

  useEffect(() => {
    if (status !== "loading") return;
    try {
      const storedAdmin = getCookie("admin");
      if (storedAdmin) {
        setAdmin(JSON.parse(storedAdmin as string) as Admin);
        setStatus("authenticated");
      } else {
        setStatus("unauthenticated");
      }
    } catch (error) {
      console.error("Error reading cookie:", error);
      setStatus("unauthenticated");
    }
  }, []);

  const signIn = async ({
    username,
    password,
  }: {
    username: string;
    password: string;
  }) => {
    if (!username || !password) {
      toast({
        title: "Invalid credentials",
        description: "Please enter a valid username and password.",
      });
      return;
    }

    try {
      const adminData = await checkCredentials(username, password);

      if (!adminData) {
        toast({
          title: "Invalid credentials",
          description: "Please enter a valid username and password.",
        });
        return;
      }

      await setCookie("admin", JSON.stringify(adminData), {
        maxAge: 30 * 24 * 60 * 60, // 30 DAYS
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        path: "/",
      });
      setAdmin(adminData);
      setStatus("authenticated");
      toast({
        title: "Welcome back!",
        description: "You have successfully signed in 🎉.",
      });
    } catch (error) {
      console.error("Error signing in:", error);
    }
  };

  const signOut = async () => {
    try {
      await deleteCookie("admin");
      setAdmin(null);
      setStatus("unauthenticated");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <AuthContext.Provider value={{ admin, signIn, signOut, status }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
