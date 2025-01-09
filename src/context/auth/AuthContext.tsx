"use client";

import {
  createContext,
  type PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
} from "react";
import { useToast } from "~/hooks/use-toast";
import { useRouter } from "next/navigation";
import { type LoginCredentials, type User } from "~/types/user";
import { useAuthentication } from "~/hooks/useAuthentication";

type AuthStatus = "loading" | "authenticated" | "unauthenticated";

type AuthContextProps = {
  user: User | undefined;
  signIn: (credentials: LoginCredentials) => Promise<void>;
  signOut: () => Promise<void>;
  status: AuthStatus;
  isPending: boolean;
};

const AuthContext = createContext<AuthContextProps>({
  user: undefined,
  signIn: () => Promise.resolve(),
  signOut: () => Promise.resolve(),
  status: "loading",
  isPending: false,
});

export function AuthProvider({ children }: PropsWithChildren) {
  const {
    user,
    status: queryStatus,
    login,
    logout,
    isAuthenticated,
  } = useAuthentication();

  const { toast } = useToast();
  const router = useRouter();

  const redirectToDashboard = useCallback(
    (role: string) => {
      const dashboardPath = `/${role.toLowerCase()}`;
      console.log("Redirecting to:", dashboardPath);
      router.replace(dashboardPath);
    },
    [router],
  );

  // Enhanced authentication effect
  useEffect(() => {
    if (queryStatus === "pending") return;

    const currentPath = window.location.pathname;

    if (isAuthenticated && user?.role) {
      if (currentPath === "/sign-in" || currentPath === "/") {
        redirectToDashboard(user.role);
      }
    } else if (!isAuthenticated && currentPath !== "/sign-in") {
      router.replace("/sign-in");
    }
  }, [isAuthenticated, user, queryStatus, redirectToDashboard, router]);

  const signIn = async (credentials: LoginCredentials) => {
    try {
      const userData = await login.mutateAsync(credentials);

      toast({
        title: "Welcome back!",
        description: "You have successfully signed in 🎉",
      });

      if (userData.role) {
        redirectToDashboard(userData.role);
      }
    } catch (error) {
      console.error("Login error:", error);
      toast({
        title: "Sign in failed",
        description:
          error instanceof Error ? error.message : "An error occurred",
      });
    }
  };

  const signOut = async () => {
    try {
      await logout.mutateAsync();
      router.push("/sign-in");
    } catch (error) {
      console.error("Logout error:", error);
      router.push("/sign-in");
    }
  };

  const status: AuthStatus =
    queryStatus === "pending"
      ? "loading"
      : isAuthenticated
        ? "authenticated"
        : "unauthenticated";

  return (
    <AuthContext.Provider
      value={{ user, signIn, signOut, status, isPending: login.isPending }}
    >
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
