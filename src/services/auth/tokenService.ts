import { type User } from "~/types/user";

export interface AuthResponse {
  user: User;
  expiresIn?: number;
}

interface ApiError {
  message: string;
}

class TokenService {
  private static instance: TokenService;
  private tokenRefreshTimeout: NodeJS.Timeout | null = null;

  private constructor() {}

  static getInstance(): TokenService {
    if (!TokenService.instance) {
      TokenService.instance = new TokenService();
    }
    return TokenService.instance;
  }

  async refreshAccessToken(): Promise<boolean> {
    try {
      const response = await fetch("/api/auth/refresh", {
        method: "POST",
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Token refresh failed");
      }

      return true;
    } catch (error) {
      console.error("Token refresh error:", error);
      return false;
    }
  }

  setupTokenRefresh(expiresIn: number) {
    // Clear any existing refresh timeout
    if (this.tokenRefreshTimeout) {
      clearTimeout(this.tokenRefreshTimeout);
    }

    // Set up new refresh timeout (refresh 1 minute before expiration)
    const refreshTime = (expiresIn - 60) * 1000;
    this.tokenRefreshTimeout = setTimeout(() => {
      void this.refreshAccessToken();
    }, refreshTime);
  }

  clearTokenRefresh() {
    if (this.tokenRefreshTimeout) {
      clearTimeout(this.tokenRefreshTimeout);
      this.tokenRefreshTimeout = null;
    }
  }

  // Helper method to handle API responses
  async handleApiResponse<T>(response: Response): Promise<T> {
    const contentType = response.headers.get("content-type");

    if (!response.ok) {
      if (contentType?.includes("application/json")) {
        const errorData = (await response.json()) as ApiError;
        throw new Error(errorData.message ?? `HTTP error! status: ${response.status}`);
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    if (!contentType?.includes("application/json")) {
      throw new Error("Invalid response format");
    }

    return await response.json() as Promise<T>;
  }
}

export const tokenService = TokenService.getInstance();
