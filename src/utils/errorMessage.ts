import { type AxiosError } from "axios";

export default function errorMessage(e: unknown) {
  return (e as AxiosError).response?.data ?? (e as Error).message ?? e;
}
