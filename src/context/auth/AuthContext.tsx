"use client";

import type { PropsWithChildren } from "react";
import { createContext, useContext, useEffect, useState } from "react";
import { deleteCookie, getCookie } from "cookies-next";
import { useToast } from "~/hooks/use-toast";
import { useRouter } from "next/navigation";
import { type LoginCredentials, type User } from "~/types/user";
import { useLogin } from "~/hooks/useLogin";

type AuthStatus = "loading" | "authenticated" | "unauthenticated";

type AuthContextProps = {
  user: User | null;
  signIn: (credentials: LoginCredentials) => Promise<void>;
  signOut: () => Promise<void>;
  status: AuthStatus;
  isPending: boolean;
};

const AuthContext = createContext<AuthContextProps>({
  user: null,
  signIn: () => Promise.resolve(),
  signOut: () => Promise.resolve(),
  status: "loading",
  isPending: false,
});

export function AuthProvider({ children }: PropsWithChildren) {
  const [user, setUser] = useState<User | null>(null);
  const [status, setStatus] = useState<AuthStatus>("loading");

  const { toast } = useToast();
  const { mutate: login, isPending } = useLogin();
  const router = useRouter();

  const getRoleBasedRoute = (userRole: string) => {
    const role = userRole.toLowerCase();
    return `/${role}`;
  };

  useEffect(() => {
    if (status !== "loading") return;
    try {
      const storedUser = getCookie("user");
      if (storedUser) {
        const userData = JSON.parse(storedUser as string) as User;
        setUser(userData);
        setStatus("authenticated");
        // Redirect to role-specific route if needed
        const currentPath = window.location.pathname;
        const expectedPath = getRoleBasedRoute(userData.role);
        if (currentPath === "/" || !currentPath.startsWith(expectedPath)) {
          router.push(expectedPath);
        }
      } else {
        setStatus("unauthenticated");
      }
    } catch (error) {
      console.error("Error reading cookie:", error);
      setStatus("unauthenticated");
    }
  }, [router]);

  const signIn = async (credentials: LoginCredentials) => {
    if (!credentials.username || !credentials.password) {
      toast({
        title: "Invalid credentials",
        description: "Please enter all required fields.",
      });
      return;
    }

    login(credentials, {
      onSuccess: (userData) => {
        setUser(userData);
        setStatus("authenticated");
        toast({
          title: "Welcome back!",
          description: "You have successfully signed in 🎉.",
        });
        // Redirect to the correct role-based route
        const roleRoute = getRoleBasedRoute(userData.role);
        router.push(roleRoute);
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
      await deleteCookie("user");
      setUser(null);
      setStatus("unauthenticated");
      router.push("/sign-in");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, signIn, signOut, status, isPending }}>
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
