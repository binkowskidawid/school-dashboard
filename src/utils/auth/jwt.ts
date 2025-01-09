import jwt from "jsonwebtoken";
import { env } from "~/env";

const ACCESS_TOKEN_SECRET = env.JWT_ACCESS_SECRET;
const REFRESH_TOKEN_SECRET = env.JWT_REFRESH_SECRET;

interface TokenPayload {
  userId: string;
  username: string;
  role: string;
}

export function generateAccessToken(payload: TokenPayload): string {
  return jwt.sign(payload, ACCESS_TOKEN_SECRET, {
    expiresIn: "15m", // Short-lived access token
  });
}

export function generateRefreshToken(payload: TokenPayload): string {
  return jwt.sign(payload, REFRESH_TOKEN_SECRET, {
    expiresIn: "7d", // Longer-lived refresh token
  });
}

export function verifyToken(
  token: string,
  isRefreshToken = false,
): TokenPayload {
  return jwt.verify(
    token,
    isRefreshToken ? REFRESH_TOKEN_SECRET : ACCESS_TOKEN_SECRET,
  ) as TokenPayload;
}
