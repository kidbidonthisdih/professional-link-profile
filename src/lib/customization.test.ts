import { describe, expect, it } from "vitest";
import { customizationSchema, readCustomization } from "./customization";

describe("profile customization", () => {
  it("keeps existing profiles usable without new settings", () => {
    expect(readCustomization({}).linkStyle).toBe("icons");
    expect(readCustomization({}).font).toBe("geist");
  });
  it("preserves saved appearance and audio options", () => {
    const c = readCustomization({ font: "serif", accent: "mint", linkStyle: "rows", musicUrl: "https://example.com/song.mp3", musicVolume: 25 });
    expect(c.font).toBe("serif");
    expect(c.accent).toBe("mint");
    expect(c.linkStyle).toBe("rows");
    expect(c.musicVolume).toBe(25);
  });
  it("rejects unsafe media protocols", () => {
    expect(customizationSchema.safeParse({ musicUrl: "javascript:alert(1)" }).success).toBe(false);
  });
  it("rejects out of range appearance values", () => {
    expect(customizationSchema.safeParse({ backgroundDim: 86 }).success).toBe(false);
    expect(customizationSchema.safeParse({ radius: -1 }).success).toBe(false);
  });
});