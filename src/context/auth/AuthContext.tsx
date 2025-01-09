import {
  createContext,
  type PropsWithChildren,
  useContext,
  useEffect,
} from "react";
import { useToast } from "~/hooks/use-toast";
import { type LoginCredentials, type User } from "~/types/user";
import { useRouter } from "next/navigation";
import {useAuth} from "~/hooks/useAuth";

/**
 * Type definition for authentication state and actions
 */
interface AuthContextType {
  user: User | undefined;
  signIn: (credentials: LoginCredentials) => Promise<void>;
  signOut: () => Promise<void>;
  isLoading: boolean;
  isAuthenticated: boolean;
}

/**
 * Create the authentication context with a default value
 */
const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Provider component that wraps the app and makes auth available to children
 */
export function AuthProvider({ children }: PropsWithChildren) {
  const {
    user,
    status,
    login,
    logout,
    isAuthenticated,
  } = useAuth();

  const { toast } = useToast();
  const router = useRouter();

  // Handle authentication state changes
  useEffect(() => {
    if (status === "pending") return;

    const currentPath = window.location.pathname;

    if (isAuthenticated && user?.role) {
      // If authenticated and on login page, redirect to dashboard
      if (currentPath === "/sign-in") {
        router.replace(`/${user.role.toLowerCase()}`);
      }
    } else if (!isAuthenticated && !currentPath.startsWith("/sign-in")) {
      // If not authenticated and not on login page, redirect to login
      router.replace("/sign-in");
    }
  }, [isAuthenticated, user, status, router]);

  /**
   * Handle user sign in
   */
  const signIn = async (credentials: LoginCredentials) => {
    try {
      await login.mutateAsync(credentials);

      toast({
        title: "Welcome back!",
        description: "You have successfully signed in",
      });
    } catch (error) {
      console.error("Login error:", error);
      toast({
        title: "Sign in failed",
        description: error instanceof Error ? error.message : "Invalid credentials",
        variant: "destructive",
      });
      throw error; // Rethrow to handle in the form component
    }
  };

  /**
   * Handle user sign out
   */
  const signOut = async () => {
    try {
      await logout.mutateAsync();
      toast({
        title: "Signed out",
        description: "You have been successfully signed out",
      });
    } catch (error) {
      console.error("Logout error:", error);
      // Always redirect to sign-in page even if logout fails
      router.push("/sign-in");
    }
  };

  const value = {
    user,
    signIn,
    signOut,
    isLoading: status === "pending" || login.isPending || logout.isPending,
    isAuthenticated,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

/**
 * Custom hook to use the auth context
 */
export function useAuthContext() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuthContext must be used within an AuthProvider");
  }
  return context;
}
