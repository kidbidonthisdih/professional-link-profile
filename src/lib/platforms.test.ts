import { describe, expect, it } from "vitest";
import { detectPlatform } from "./platforms";

describe("detectPlatform", () => {
  it("detects twitch", () => expect(detectPlatform("https://www.twitch.tv/vexa")).toBe("twitch"));
  it("detects twitter as x", () => expect(detectPlatform("https://twitter.com/a")).toBe("x"));
  it("falls back to custom", () => expect(detectPlatform("https://vexa.gg")).toBe("custom"));
  it("handles bad urls", () => expect(detectPlatform("not a url")).toBe("custom"));
});
