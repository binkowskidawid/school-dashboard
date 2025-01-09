import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { type LoginCredentials, type User } from "~/types/user";
import {type AuthResponse, tokenService} from "~/services/auth/tokenService";

export const authKeys = {
  user: ["user"] as const,
  session: ["session"] as const,
};

export function useAuthentication() {
  const queryClient = useQueryClient();

  // User query with proper error handling and token refresh
  const { data: user, status } = useQuery<User, Error>({
    queryKey: authKeys.user,
    queryFn: async () => {
      try {
        const response = await fetch("/api/auth/me", {
          credentials: "include",
        });

        if (response.status === 401) {
          // Try to refresh the token if unauthorized
          const refreshSuccess = await tokenService.refreshAccessToken();
          if (refreshSuccess) {
            // Retry the original request
            const newResponse = await fetch("/api/auth/me", {
              credentials: "include",
            });
            return tokenService.handleApiResponse<AuthResponse>(newResponse).then(data => data.user);
          }
          throw new Error("Authentication failed");
        }

        return tokenService.handleApiResponse<AuthResponse>(response).then(data => data.user);
      } catch (error) {
        console.error("Auth check failed:", error);
        throw error;
      }
    },
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });

  // Login mutation with proper token handling
  const login = useMutation<User, Error, LoginCredentials>({
    mutationFn: async (credentials) => {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(credentials),
      });

      const data = await tokenService.handleApiResponse<AuthResponse>(response);

      // Setup token refresh if expiresIn is provided
      if (data.expiresIn) {
        tokenService.setupTokenRefresh(data.expiresIn);
      }

      return data.user;
    },
    onSuccess: (userData) => {
      queryClient.setQueryData(authKeys.user, userData);
    },
  });

  // Logout mutation with proper cleanup
  const logout = useMutation<void, Error>({
    mutationFn: async () => {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
      await tokenService.handleApiResponse(response);
      tokenService.clearTokenRefresh();
    },
    onSuccess: async () => {
      queryClient.setQueryData(authKeys.user, null);
      await queryClient.invalidateQueries();
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
