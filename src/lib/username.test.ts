import { describe, expect, it } from "vitest";
import { validateUsername } from "./username";

describe("validateUsername", () => {
  it("rejects names shorter than 3", () => expect(validateUsername("ab").ok).toBe(false));
  it("rejects names longer than 20", () => expect(validateUsername("a".repeat(21)).ok).toBe(false));
  it("accepts 20 chars", () => expect(validateUsername("a".repeat(20)).ok).toBe(true));
  it("rejects invalid characters", () => expect(validateUsername("vexa!").ok).toBe(false));
  it("rejects reserved names", () => expect(validateUsername("dashboard").ok).toBe(false));
  it("lowercases input", () => expect(validateUsername("Vexa.GG")).toEqual({ ok: true, value: "vexa.gg" }));
});
