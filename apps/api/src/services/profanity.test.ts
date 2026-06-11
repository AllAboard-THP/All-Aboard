import { describe, it, expect, vi } from "vitest";
import type { AppDatabase } from "../db/client.js";
import {
  contentShouldBeFlagged,
  isModerationClaudeEnabled,
  isValidRegexPattern,
  matchesBannedRegex,
  matchesLocalModerationRules,
} from "./profanity.js";

function mockDbWithDenylist(rows: Array<{ pattern: string }>): AppDatabase {
  return {
    select: () => ({
      from: () => ({
        where: () => Promise.resolve(rows),
      }),
    }),
  } as unknown as AppDatabase;
}

describe("profanity", () => {
  it("matchesBannedRegex detects hardcoded terms", () => {
    expect(matchesBannedRegex("what the fuck")).toBe(true);
    expect(matchesBannedRegex("bonjour le monde")).toBe(false);
  });

  it("isValidRegexPattern rejects invalid regex", () => {
    expect(isValidRegexPattern("[invalid")).toBe(false);
    expect(isValidRegexPattern("spam+")).toBe(true);
  });

  it("isModerationClaudeEnabled respects MODERATION_CLAUDE_ENABLED", () => {
    const prev = process.env.MODERATION_CLAUDE_ENABLED;
    delete process.env.MODERATION_CLAUDE_ENABLED;
    expect(isModerationClaudeEnabled()).toBe(true);

    process.env.MODERATION_CLAUDE_ENABLED = "false";
    expect(isModerationClaudeEnabled()).toBe(false);

    if (prev !== undefined) {
      process.env.MODERATION_CLAUDE_ENABLED = prev;
    } else {
      delete process.env.MODERATION_CLAUDE_ENABLED;
    }
  });

  it("matchesLocalModerationRules checks regex before denylist", async () => {
    const db = mockDbWithDenylist([{ pattern: "unique-denylist-token" }]);
    await expect(
      matchesLocalModerationRules(db, "what the fuck"),
    ).resolves.toBe(true);
    await expect(
      matchesLocalModerationRules(db, "contains unique-denylist-token"),
    ).resolves.toBe(true);
    await expect(
      matchesLocalModerationRules(db, "clean content"),
    ).resolves.toBe(false);
  });

  it("contentShouldBeFlagged skips agent when local rules do not match", async () => {
    const db = mockDbWithDenylist([]);
    const evaluateModeration = vi.fn().mockResolvedValue(true);
    await expect(
      contentShouldBeFlagged(db, "bonjour", evaluateModeration),
    ).resolves.toBe(false);
    expect(evaluateModeration).not.toHaveBeenCalled();
  });

  it("contentShouldBeFlagged flags on regex hit when Claude disabled", async () => {
    const prev = process.env.MODERATION_CLAUDE_ENABLED;
    process.env.MODERATION_CLAUDE_ENABLED = "false";
    const db = mockDbWithDenylist([]);
    const evaluateModeration = vi.fn().mockResolvedValue(false);
    try {
      await expect(
        contentShouldBeFlagged(db, "what the fuck", evaluateModeration),
      ).resolves.toBe(true);
      expect(evaluateModeration).not.toHaveBeenCalled();
    } finally {
      if (prev !== undefined) {
        process.env.MODERATION_CLAUDE_ENABLED = prev;
      } else {
        delete process.env.MODERATION_CLAUDE_ENABLED;
      }
    }
  });

  it("contentShouldBeFlagged defers to agent after local hit", async () => {
    const prev = process.env.MODERATION_CLAUDE_ENABLED;
    delete process.env.MODERATION_CLAUDE_ENABLED;
    const db = mockDbWithDenylist([]);
    const evaluateModeration = vi.fn().mockResolvedValue(false);
    try {
      await expect(
        contentShouldBeFlagged(db, "what the fuck", evaluateModeration),
      ).resolves.toBe(false);
      expect(evaluateModeration).toHaveBeenCalledWith("what the fuck");
    } finally {
      if (prev !== undefined) {
        process.env.MODERATION_CLAUDE_ENABLED = prev;
      } else {
        delete process.env.MODERATION_CLAUDE_ENABLED;
      }
    }
  });
});
