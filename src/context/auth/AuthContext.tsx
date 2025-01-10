import {createContext, type PropsWithChildren, useContext, useEffect,} from "react";
import {useToast} from "~/hooks/use-toast";
import {type LoginCredentials, type User} from "~/types/user";
import {useRouter} from "next/navigation";
import {useAuth} from "~/hooks/useAuth";

/**
 * Defines the shape of the authentication context state and methods.
 * This interface provides type safety for authentication operations throughout the app.
 * @interface
 */
interface AuthContextType {
  /** The currently authenticated user or undefined if not logged in */
  user: User | undefined;
  /** Signs in a user with provided credentials */
  signIn: (credentials: LoginCredentials) => Promise<void>;
  /** Signs out the current user */
  signOut: () => Promise<void>;
  /** Indicates if an authentication operation is in progress */
  isLoading: boolean;
  /** Indicates if a user is currently authenticated */
  isAuthenticated: boolean;
}

/**
 * React Context for managing global authentication state.
 * Initialized as undefined and populated by AuthProvider.
 */
const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Provider component that manages authentication state and operations.
 * Wraps the application to provide authentication context to all child components.
 *
 * @component
 * @param {PropsWithChildren} props - React children to be wrapped by the provider
 * @returns {JSX.Element} Provider component with authentication context
 *
 * @example
 * <AuthProvider>
 *   <App />
 * </AuthProvider>
 */
export function AuthProvider({ children }: PropsWithChildren) {
  const { user, status, login, logout, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const router = useRouter();

  /**
   * Effect to handle authentication state changes and navigation
   * Redirects users based on their authentication status
   */
  useEffect(() => {
    if (status === "pending") return;

    const currentPath = window.location.pathname;

    if (isAuthenticated && user?.role) {
      if (currentPath === "/sign-in" || currentPath === "/") {
        router.replace(`/${user.role.toLowerCase()}`);
      }
    } else if (!isAuthenticated && !currentPath.startsWith("/sign-in")) {
      router.replace("/sign-in");
    }
  }, [isAuthenticated, user, status, router]);

  /**
   * Handles user sign-in process with feedback
   * @param {LoginCredentials} credentials - User login credentials
   * @throws {Error} When login fails
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
        description:
          error instanceof Error ? error.message : "Invalid credentials",
        variant: "destructive",
      });
      throw error;
    }
  };

  /**
   * Handles user sign-out process with feedback
   * Always redirects to sign-in page, even on failure
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

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * Custom hook to access the authentication context.
 * Must be used within an AuthProvider component tree.
 *
 * @returns {AuthContextType} The authentication context value
 * @throws {Error} When used outside of AuthProvider
 *
 * @example
 * function MyComponent() {
 *   const { user, signIn } = useAuthContext();
 *   // Use authentication context
 * }
 */
export function useAuthContext(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuthContext must be used within an AuthProvider");
  }
  return context;
}
