import * as jose from "jose";
import {env} from "~/env";

/**
 * Represents the required structure for JWT token payloads, extending jose's base payload
 * with our application-specific fields for user authentication.
 * @interface TokenPayload
 * @extends {jose.JWTPayload}
 */
interface TokenPayload extends jose.JWTPayload {
  userId: string;
  username: string;
  role: string;
}

// Initialize encoder and secret key for JWT operations
const textEncoder = new TextEncoder();
const secretKey = textEncoder.encode(env.JWT_ACCESS_SECRET);

/**
 * Creates a JWT token for user authentication that expires in 24 hours.
 * @async
 * @param {TokenPayload} payload - The user data to encode in the token
 * @returns {Promise<string>} The signed JWT token
 * @throws {Error} If token signing fails
 */
export async function generateToken(payload: TokenPayload): Promise<string> {
  return await new jose.SignJWT({
    userId: payload.userId,
    username: payload.username,
    role: payload.role,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("24h")
    .sign(secretKey);
}

/**
 * Generates a random refresh token using Web Crypto API.
 * This implementation is compatible with both Edge and Node.js runtimes.
 * @async
 * @returns {Promise<string>} A cryptographically secure random token
 */
export async function generateRefreshToken(): Promise<string> {
  // GENERATE 32 RANDOM BYTES (256 BITS)
  const buffer = new Uint8Array(32);
  crypto.getRandomValues(buffer);

  // CONVERT TO HEXADECIMAL STRING
  return Array.from(buffer)
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

/**
 * Verifies and decodes a JWT token, ensuring all required user fields are present.
 * @async
 * @param {string} token - The JWT token to verify
 * @returns {Promise<TokenPayload>} The decoded token payload
 * @throws {Error} If token is invalid or missing required fields
 */
export async function verifyToken(token: string): Promise<TokenPayload> {
  try {
    const { payload } = await jose.jwtVerify(token, secretKey);

    // TYPE CHECKING TO ENSURE WE HAVE ALL REQUIRED FIELDS
    if (!payload.userId || !payload.username || !payload.role) {
      throw new Error("Missing required payload fields");
    }

    return {
      userId: payload.userId as string,
      username: payload.username as string,
      role: payload.role as string,
      ...payload,
    };
  } catch (error) {
    console.error("Token verification failed:", error);
    throw new Error("Invalid token");
  }
}
