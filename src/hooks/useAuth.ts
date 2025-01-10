import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query";
import {type LoginCredentials, type User} from "~/types/user";
import {useRouter} from "next/navigation";
import type {AuthResponse, ErrorResponse} from "~/types/auth";

/**
 * Custom hook that provides authentication state management and operations.
 * Uses React Query for server state management and caching.
 *
 * @returns {Object} Authentication state and operations
 * @property {User | undefined} user - The current user data
 * @property {string} status - Current status of auth query
 * @property {Object} login - Login mutation object
 * @property {Object} logout - Logout mutation object
 * @property {boolean} isAuthenticated - Whether user is authenticated
 *
 * @example
 * function AuthComponent() {
 *   const { user, login, logout } = useAuth();
 *   // Use auth operations
 * }
 */
export function useAuth() {
  const queryClient = useQueryClient();
  const router = useRouter();

  /**
   * Query to check and maintain authentication status
   * Includes retry and cache configuration
   */
  const { data: user, status } = useQuery({
    queryKey: ["auth-user"],
    queryFn: async () => {
      const response = await fetch("/api/auth/me", {
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Not authenticated");
      }

      const data = (await response.json()) as { user: User };
      return data.user;
    },
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  /**
   * Mutation for handling user login
   * Includes success handling and error management
   */
  const login = useMutation({
    mutationKey: ["login"],
    mutationFn: async (credentials: LoginCredentials) => {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(credentials),
      });

      if (!response.ok) {
        const error = (await response.json()) as ErrorResponse;
        throw new Error(error.error || "Login failed");
      }

      const data = (await response.json()) as AuthResponse;
      return data.user;
    },
    onSuccess: (user) => {
      queryClient.setQueryData(["auth-user"], user);
    },
  });

  /**
   * Mutation for handling user logout
   * Clears cache and redirects on success
   */
  const logout = useMutation({
    mutationKey: ["logout"],
    mutationFn: async () => {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/sign-in");
    },
    onSuccess: () => {
      queryClient.clear();
    },
  });

  return {
    user,
    status,
    login,
    logout,
    isAuthenticated: status === "success" && !!user,
  };
}
