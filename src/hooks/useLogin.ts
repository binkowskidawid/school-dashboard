import { useMutation } from "@tanstack/react-query";
import { type Admin } from "@prisma/client";
import { setCookie } from "cookies-next";

export interface LoginCredentials {
  username: string;
  password: string;
}

export function useLogin() {
  return useMutation({
    mutationFn: async (credentials: LoginCredentials) => {
      const response = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(credentials),
      });

      if (!response.ok) {
        throw new Error("Invalid credentials");
      }

      const data = (await response.json()) as { admin: Admin };
      return data.admin;
    },
    onSuccess: async (admin) => {
      await setCookie("admin", JSON.stringify(admin), {
        maxAge: 30 * 24 * 60 * 60,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        path: "/",
      });
    },
  });
}
