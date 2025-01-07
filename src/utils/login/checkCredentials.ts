import { type Admin } from "@prisma/client";
import axios from "axios";

export const checkCredentials = async (
  username?: string,
  password?: string,
): Promise<Admin | null | undefined> => {
  if (!username || !password) {
    return null;
  }
  try {
    const response = await axios.post<{ admin: Admin }>(
      "/api/login",
      {
        username,
        password,
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      },
    );
    if (!response.data.admin) {
      return null;
    }

    return response.data.admin;
  } catch (error) {
    console.error(error);
    return null;
  }
};
