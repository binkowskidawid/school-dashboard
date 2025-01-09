import jwt from "jsonwebtoken";
import { env } from "~/env";

// TYPE FOR THE DATA WE STORE IN THE JWT
export interface TokenPayload {
  userId: string;
  username: string;
  role: string;
}

/**
 * Generates a JWT token containing user information
 * @param payload User information to encode in the token
 * @returns JWT token string
 */
export function generateToken(payload: TokenPayload): string {
  return jwt.sign(payload, env.JWT_ACCESS_SECRET, {
    expiresIn: "24h", // SINGLE TOKEN THAT LASTS 24 HOURS
  });
}

/**
 * Verifies and decodes a JWT token
 * @param token JWT token to verify
 * @returns Decoded token payload
 * @throws Error if token is invalid
 */
export function verifyToken(token: string): TokenPayload {
  try {
    return jwt.verify(token, env.JWT_ACCESS_SECRET) as TokenPayload;
  } catch (error) {
    throw new Error("Invalid token");
  }
}
