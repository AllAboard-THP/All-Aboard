export type ApiErrorKey =
  | "not_found"
  | "invalid_credentials"
  | "duplicate"
  | "database_unavailable"
  | "unauthorized"
  | "generic";

export function mapApiErrorToKey(error: string | null): ApiErrorKey {
  if (!error) {
    return "generic";
  }
  if (error === "not_found") {
    return "not_found";
  }
  if (error === "invalid_credentials") {
    return "invalid_credentials";
  }
  if (error === "duplicate") {
    return "duplicate";
  }
  if (error === "unauthorized") {
    return "unauthorized";
  }
  if (
    error.includes("database") ||
    error.includes("503") ||
    error.includes("Network error")
  ) {
    return "database_unavailable";
  }
  return "generic";
}
