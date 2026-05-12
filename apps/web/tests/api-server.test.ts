import { describe, it, expect } from "vitest";
import { parseFeedResponse } from "@/lib/api-server";

describe("parseFeedResponse", () => {
  it("accepts valid feed", () => {
    const data = {
      items: [
        {
          id: "1",
          title: "Hello",
          authorId: "u",
          createdAt: "2020-01-01T00:00:00.000Z",
        },
      ],
    };
    expect(parseFeedResponse(data)).toEqual(data);
  });

  it("rejects non-object", () => {
    expect(() => parseFeedResponse(null)).toThrow("expected object");
  });

  it("rejects missing items", () => {
    expect(() => parseFeedResponse({})).toThrow("items must be an array");
  });

  it("rejects bad item shape", () => {
    expect(() =>
      parseFeedResponse({ items: [{ id: 1 }] }),
    ).toThrow("item shape");
  });
});
