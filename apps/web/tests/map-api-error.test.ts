import { describe, expect, it } from "vitest";

import {
  ApiRequestError,
  extractApiErrorCode,
  mapApiError,
  parseApiErrorBody,
  throwFromApiResponse,
} from "@/lib/map-api-error";

describe("parseApiErrorBody", () => {
  it("parses JSON string with error code", () => {
    expect(parseApiErrorBody('{"error":"invalid_credentials"}')).toEqual({
      error: "invalid_credentials",
    });
  });

  it("parses duplicate with existingId", () => {
    expect(
      parseApiErrorBody('{"error":"duplicate","existingId":"req-1"}'),
    ).toEqual({ error: "duplicate", existingId: "req-1" });
  });

  it("returns object body as-is", () => {
    expect(parseApiErrorBody({ error: "not_found" })).toEqual({
      error: "not_found",
    });
  });

  it("returns null for invalid JSON", () => {
    expect(parseApiErrorBody("not json")).toBeNull();
  });

  it("returns null for empty input", () => {
    expect(parseApiErrorBody("")).toBeNull();
    expect(parseApiErrorBody(null)).toBeNull();
  });
});

describe("mapApiError", () => {
  it("maps auth error codes", () => {
    expect(
      mapApiError({
        status: 401,
        body: '{"error":"invalid_credentials"}',
      }),
    ).toBe("invalidCredentials");
    expect(
      mapApiError({ status: 401, body: { error: "missing_token" } }),
    ).toBe("missingToken");
  });

  it("maps validation and not-found codes", () => {
    expect(
      mapApiError({ status: 400, body: { error: "invalid_body" } }),
    ).toBe("invalidBody");
    expect(
      mapApiError({ status: 400, body: { error: "invalid_subject" } }),
    ).toBe("invalidSubject");
    expect(
      mapApiError({ status: 404, body: { error: "not_found" } }),
    ).toBe("notFound");
  });

  it("maps duplicate and service errors", () => {
    expect(
      mapApiError({ status: 409, body: { error: "duplicate" } }),
    ).toBe("duplicate");
    expect(
      mapApiError({ status: 503, body: { error: "database_unavailable" } }),
    ).toBe("serviceUnavailable");
    expect(
      mapApiError({ status: 500, body: { error: "insert_failed" } }),
    ).toBe("serverError");
  });

  it("maps moderation code", () => {
    expect(
      mapApiError({ status: 400, body: { error: "content_moderation" } }),
    ).toBe("contentModeration");
  });

  it("falls back to HTTP status when body has no code", () => {
    expect(mapApiError({ status: 403, body: "" })).toBe("forbidden");
    expect(mapApiError({ status: 503, body: null })).toBe("serviceUnavailable");
  });

  it("returns unknown for unmapped status and code", () => {
    expect(mapApiError({ status: 418, body: { error: "teapot" } })).toBe(
      "unknown",
    );
  });
});

describe("extractApiErrorCode", () => {
  it("extracts code and existingId from body", () => {
    expect(
      extractApiErrorCode({
        status: 409,
        body: '{"error":"duplicate","existingId":"abc"}',
      }),
    ).toEqual({ code: "duplicate", existingId: "abc" });
  });

  it("uses http status when body is not parseable", () => {
    expect(extractApiErrorCode({ status: 502, body: "bad gateway" })).toEqual({
      code: "http_502",
    });
  });
});

describe("throwFromApiResponse", () => {
  it("throws ApiRequestError with parsed fields", () => {
    expect(() =>
      throwFromApiResponse(
        409,
        JSON.stringify({ error: "duplicate", existingId: "hr-99" }),
      ),
    ).toThrow(ApiRequestError);

    try {
      throwFromApiResponse(
        409,
        JSON.stringify({ error: "duplicate", existingId: "hr-99" }),
      );
    } catch (err) {
      expect(err).toBeInstanceOf(ApiRequestError);
      const apiErr = err as ApiRequestError;
      expect(apiErr.status).toBe(409);
      expect(apiErr.code).toBe("duplicate");
      expect(apiErr.existingId).toBe("hr-99");
    }
  });

  it("falls back to http status code when body is empty", () => {
    try {
      throwFromApiResponse(401, "");
    } catch (err) {
      expect((err as ApiRequestError).code).toBe("http_401");
    }
  });
});
