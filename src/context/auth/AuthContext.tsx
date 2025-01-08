"use client";

import { type Admin } from "@prisma/client";
import type { PropsWithChildren } from "react";
import { createContext, useContext, useEffect, useState } from "react";
import { deleteCookie, getCookie } from "cookies-next";
import { useToast } from "~/hooks/use-toast";
import { type LoginCredentials, useLogin } from "~/hooks/useLogin";
import { useRouter } from "next/navigation";

type AuthStatus = "loading" | "authenticated" | "unauthenticated";

type AuthContextProps = {
  admin: Admin | null;
  signIn: (credentials: {
    username: string;
    password: string;
  }) => Promise<void>;
  signOut: () => Promise<void>;
  status: AuthStatus;
  isPending: boolean;
};

const AuthContext = createContext<AuthContextProps>({
  admin: null,
  signIn: () => Promise.resolve(),
  signOut: () => Promise.resolve(),
  status: "loading",
  isPending: false,
});

export function AuthProvider({ children }: PropsWithChildren) {
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [status, setStatus] = useState<AuthStatus>("loading");

  const { toast } = useToast();
  const { mutate: login, isPending } = useLogin();
  const router = useRouter();

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

  const signIn = async (credentials: LoginCredentials) => {
    if (!credentials.username || !credentials.password) {
      toast({
        title: "Invalid credentials",
        description: "Please enter a valid username and password.",
      });
      return;
    }

    login(credentials, {
      onSuccess: (adminData) => {
        setAdmin(adminData);
        setStatus("authenticated");
        toast({
          title: "Welcome back!",
          description: "You have successfully signed in 🎉.",
        });
        router.push("/");
      },
      onError: (error) => {
        toast({
          title: "Sign in failed",
          description: error.message,
        });
      },
    });
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
    <AuthContext.Provider value={{ admin, signIn, signOut, status, isPending }}>
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
