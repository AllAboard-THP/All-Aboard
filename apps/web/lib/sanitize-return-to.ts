import { DEFAULT_POST_LOGIN_PATH } from "@/lib/app-routes";

/** Restricts post-auth redirects to same-origin relative paths. */
export function sanitizeReturnTo(value?: string | null): string {
  if (!value || !value.startsWith("/") || value.startsWith("//")) {
    return DEFAULT_POST_LOGIN_PATH;
  }
  if (value === "/") {
    return DEFAULT_POST_LOGIN_PATH;
  }
  return value;
}
