/** Restricts post-auth redirects to same-origin relative paths. */
export function sanitizeReturnTo(value?: string | null): string {
  if (!value || !value.startsWith("/") || value.startsWith("//")) {
    return "/";
  }
  return value;
}
