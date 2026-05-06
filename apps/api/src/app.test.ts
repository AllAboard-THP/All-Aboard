import { describe, it, expect } from "vitest";
import { buildApp } from "./app";

describe("api", () => {
  it("GET /health returns 200", async () => {
    const app = buildApp();
    const res = await app.inject({ method: "GET", url: "/health" });
    expect(res.statusCode).toBe(200);
    expect(JSON.parse(res.payload)).toEqual({ status: "ok" });
    await app.close();
  });
});
