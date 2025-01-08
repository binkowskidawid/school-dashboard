import { useMutation } from "@tanstack/react-query";
import { setCookie } from "cookies-next";
import { type LoginCredentials, type User } from "~/types/user";

export function useLogin() {
  return useMutation({
    mutationFn: async (credentials: LoginCredentials) => {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(credentials),
      });

      if (!response.ok) {
        throw new Error("Invalid credentials");
      }

      const data = (await response.json()) as { user: User };
      return data.user;
    },
    onSuccess: async (user) => {
      await setCookie("user", JSON.stringify(user), {
        maxAge: 30 * 24 * 60 * 60,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        path: "/",
      });
    },
  });
}
