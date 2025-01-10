import bcrypt from "bcryptjs";

/**
 * Hashes a password using bcrypt with a salt factor of 12.
 * This provides a secure one-way hash suitable for password storage.
 * @async
 * @param {string} password - The plain text password to hash
 * @returns {Promise<string>} The hashed password
 * @example
 * const hashedPassword = await hashPassword("myPassword123");
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

/**
 * Verifies a password against its hashed version.
 * Used during authentication to validate user credentials.
 * @async
 * @param {string} password - The plain text password to verify
 * @param {string} hashedPassword - The hashed password to compare against
 * @returns {Promise<boolean>} True if the password matches, false otherwise
 * @example
 * const isValid = await verifyPassword("myPassword123", hashedPassword);
 * if (isValid) {
 *   // Password matches
 * }
 */
export async function verifyPassword(
  password: string,
  hashedPassword: string,
): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}
