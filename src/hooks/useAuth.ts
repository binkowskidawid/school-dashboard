import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { type LoginCredentials, type User } from "~/types/user";
import { useRouter } from "next/navigation";

/**
 * Custom hook for managing authentication state and operations
 */
export function useAuth() {
  const queryClient = useQueryClient();
  const router = useRouter();

  // Fetch current user
  const { data: user, status } = useQuery<User>({
    queryKey: ["auth-user"],
    queryFn: async () => {
      const response = await fetch("/api/auth/me");
      if (!response.ok) throw new Error("Not authenticated");
      const data = await response.json() as { user: User };
      return data.user;
    },
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Login mutation
  const login = useMutation({
    mutationFn: async (credentials: LoginCredentials) => {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(credentials),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Login failed");
      }

      const data = await response.json();
      return data.user;
    },
    onSuccess: (userData) => {
      queryClient.setQueryData(["auth-user"], userData);
      router.push(`/${userData.role.toLowerCase()}`);
    },
  });

  // Logout mutation
  const logout = useMutation({
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
