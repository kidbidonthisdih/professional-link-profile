export const RESERVED_USERNAMES = [
  "login","signup","dashboard","admin","api","auth","settings","about","help","support",
  "terms","privacy","www","app","root","null","undefined","logout","account",
] as const;

export type UsernameCheck = { ok: true; value: string } | { ok: false; reason: string };

/** Mirrors the database rule: 3-20 chars, a-z 0-9 _ . , not reserved. */
export function validateUsername(input: string): UsernameCheck {
  const value = input.trim().toLowerCase();
  if (value.length < 3) return { ok: false, reason: "At least 3 characters" };
  if (value.length > 20) return { ok: false, reason: "20 characters max" };
  if (!/^[a-z0-9_.]+$/.test(value)) return { ok: false, reason: "Letters, numbers, _ and . only" };
  if ((RESERVED_USERNAMES as readonly string[]).includes(value)) return { ok: false, reason: "Reserved" };
  return { ok: true, value };
}
