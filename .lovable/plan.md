# Biolink platform for gamers and streamers

Monochrome (black, white, blackish gray), no gradients, no glow, no pill badges. Typography: Geist for UI, Geist Mono for handles, stats and metadata. Sharp 6px radius, 1px hairline borders, motion only on hover/focus states.

## Pages
- `/` Landing: one headline, a "claim yoursite/name" input that checks availability live, a real rendered example profile beside it, short feature list in plain text rows (not icon cards), footer.
- `/signup`, `/login`: email + password; username chosen at signup and reserved.
- `/dashboard` (signed in): edit profile with live preview side by side.
  - Display name, bio (160 chars), avatar upload, background image or solid color
  - Links: add, reorder, remove; platform auto-detected from URL (Discord, Twitch, YouTube, Kick, Steam, X, TikTok, Spotify, GitHub, custom)
  - Discord tag / Steam ID fields, view counter toggle
- `/$username` Public profile: centered card over the background, avatar, name, bio, icon link row, view count, "made with" footer link. Proper 404 for unknown names, per-profile title/description meta.

## Sample data
Seeded demo profiles (e.g. `vexa`, `kairo`) with realistic bios like "Valorant Immortal 2, streaming weeknights 8pm CET" so the landing example and links work on first load.

## Technical
- Lovable Cloud: auth (email/password), `profiles` table (username unique, lowercase, 3-20 chars a-z0-9_.), `links` table (profile_id, platform, url, position), `profile_views` counter via RPC. RLS: public read, owner write. Storage bucket for avatars/backgrounds.
- Reserved usernames list (login, dashboard, admin, api...).
- Validation with zod on client and in RLS-compatible constraints; errors surfaced via toast, never swallowed.
- Tests for username rules (length, charset, reserved names).

## Trade-offs
- No custom cursors, music players or typewriter effects in v1; they're common on guns.lol but add weight. Easy to add later.
- Email required at signup (enables password reset) instead of username-only login.
