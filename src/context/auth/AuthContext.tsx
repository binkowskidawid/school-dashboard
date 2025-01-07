"use client";

import { type Admin } from "@prisma/client";
import type { PropsWithChildren } from "react";
import { createContext, useContext, useEffect, useState } from "react";

type AuthStatus = "loading" | "authenticated" | "unauthenticated";

type AuthContextProps = {
  admin: Admin | null;
  signIn: () => void;
  signOut: () => void;
  status: AuthStatus;
};

const AuthContext = createContext<AuthContextProps>({
  admin: null,
  signIn: () => null,
  signOut: () => null,
  status: "loading",
});

export function AuthProvider({ children }: PropsWithChildren) {
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [status, setStatus] = useState<AuthStatus>("loading");

  useEffect(() => {
    try {
      const storedAdmin = localStorage.getItem("admin");
      if (storedAdmin) {
        setAdmin(JSON.parse(storedAdmin) as Admin);
        setStatus("authenticated");
      } else {
        setStatus("unauthenticated");
      }
    } catch (error) {
      console.error("Error reading from localStorage:", error);
      setStatus("unauthenticated");
    }
  }, []);

  const signIn = () => {
    const adminData: Admin = {
      id: "admin1",
      name: "Admin",
      username: "admin1",
      password: null,
    };

    try {
      localStorage.setItem("admin", JSON.stringify(adminData));
      setAdmin(adminData);
      setStatus("authenticated");
    } catch (error) {
      console.error("Error signing in:", error);
    }
  };

  const signOut = () => {
    try {
      localStorage.removeItem("admin");
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
