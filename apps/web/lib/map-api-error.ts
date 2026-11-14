/**
 * Maps BFF/API HTTP status and machine-readable error codes to `errors.*` i18n keys.
 * API codes stay unchanged; translation happens at display time (ADR 0005).
 */

export type ApiErrorMessageKey =
  | "invalidCredentials"
  | "unauthorized"
  | "missingToken"
  | "forbidden"
  | "notFound"
  | "duplicate"
  | "conflict"
  | "invalidBody"
  | "invalidSubject"
  | "serviceUnavailable"
  | "serverError"
  | "emailTaken"
  | "loginNotConfigured"
  | "userNotFound"
  | "invalidRegex"
  | "contentModeration"
  | "cguRequired"
  | "challengeExpired"
  | "verificationFailed"
  | "unknown";

export type ApiErrorBody = {
  error?: string;
  existingId?: string;
};

export type ApiErrorInput = {
  status: number;
  body?: string | ApiErrorBody | null;
};

export class ApiRequestError extends Error {
  readonly status: number;
  readonly code: string;
  readonly existingId?: string;

  constructor(status: number, code: string, existingId?: string) {
    super(code);
    this.name = "ApiRequestError";
    this.status = status;
    this.code = code;
    this.existingId = existingId;
  }
}

const CODE_TO_KEY: Record<string, ApiErrorMessageKey> = {
  invalid_credentials: "invalidCredentials",
  unauthorized: "unauthorized",
  missing_token: "missingToken",
  forbidden: "forbidden",
  not_found: "notFound",
  duplicate: "duplicate",
  invalid_body: "invalidBody",
  invalid_subject: "invalidSubject",
  database_unavailable: "serviceUnavailable",
  insert_failed: "serverError",
  update_failed: "serverError",
  create_failed: "serverError",
  email_taken: "emailTaken",
  login_not_configured: "loginNotConfigured",
  user_not_found: "userNotFound",
  invalid_regex: "invalidRegex",
  content_moderation: "contentModeration",
  cannot_change_admin_role: "forbidden",
  cgu_required: "cguRequired",
  challenge_expired: "challengeExpired",
  verification_failed: "verificationFailed",
};

const STATUS_FALLBACK: Partial<Record<number, ApiErrorMessageKey>> = {
  401: "unauthorized",
  403: "forbidden",
  404: "notFound",
  409: "conflict",
  500: "serverError",
  503: "serviceUnavailable",
};

export function parseApiErrorBody(
  body: string | ApiErrorBody | null | undefined,
): ApiErrorBody | null {
  if (body == null || body === "") return null;
  if (typeof body === "object") return body;
  try {
    const parsed = JSON.parse(body) as unknown;
    if (parsed && typeof parsed === "object" && "error" in parsed) {
      return parsed as ApiErrorBody;
    }
  } catch {
    return null;
  }
  return null;
}

export function extractApiErrorCode(input: ApiErrorInput): {
  code: string;
  existingId?: string;
} {
  const parsed = parseApiErrorBody(input.body);
  if (parsed?.error) {
    return { code: parsed.error, existingId: parsed.existingId };
  }
  return { code: `http_${input.status}` };
}

export function mapApiError(input: ApiErrorInput): ApiErrorMessageKey {
  const { code } = extractApiErrorCode(input);
  if (CODE_TO_KEY[code]) return CODE_TO_KEY[code]!;
  const statusKey = STATUS_FALLBACK[input.status];
  if (statusKey) return statusKey;
  return "unknown";
}

/** Throws {@link ApiRequestError} from a non-OK fetch response body. */
export function throwFromApiResponse(status: number, bodyText: string): never {
  const parsed = parseApiErrorBody(bodyText);
  const code = parsed?.error ?? `http_${status}`;
  throw new ApiRequestError(status, code, parsed?.existingId);
}
