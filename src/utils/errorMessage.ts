import {type AxiosError} from "axios";

/**
 * Extracts a human-readable error message from different error types.
 * This utility function handles errors from Axios requests, standard JavaScript
 * Error objects, and unknown error types, providing a consistent error message format.
 *
 * The function attempts to extract error information in the following order:
 * 1. Axios error response data
 * 2. Standard error message
 * 3. Raw error value as fallback
 *
 * @param {unknown} e - The error to process, can be any type
 * @returns {any} The extracted error message, or the original error if no message found
 *
 * @example
 * try {
 *   await someApiCall();
 * } catch (error) {
 *   const message = errorMessage(error);
 *   // message will contain response data for Axios errors
 *   // or error. Message for standard errors
 * }
 */
export default function errorMessage(e: unknown) {
  return (e as AxiosError).response?.data ?? (e as Error).message ?? e;
}
