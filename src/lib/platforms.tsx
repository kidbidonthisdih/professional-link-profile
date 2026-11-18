import { siDiscord, siGithub, siKick, siSpotify, siSteam, siTiktok, siTwitch, siX, siYoutube } from "simple-icons";
import { Link2 } from "lucide-react";

export const PLATFORMS = {
  twitch: { label: "Twitch", icon: siTwitch, hosts: ["twitch.tv"] },
  youtube: { label: "YouTube", icon: siYoutube, hosts: ["youtube.com", "youtu.be"] },
  kick: { label: "Kick", icon: siKick, hosts: ["kick.com"] },
  discord: { label: "Discord", icon: siDiscord, hosts: ["discord.gg", "discord.com"] },
  steam: { label: "Steam", icon: siSteam, hosts: ["steamcommunity.com", "store.steampowered.com"] },
  x: { label: "X", icon: siX, hosts: ["x.com", "twitter.com"] },
  tiktok: { label: "TikTok", icon: siTiktok, hosts: ["tiktok.com"] },
  spotify: { label: "Spotify", icon: siSpotify, hosts: ["open.spotify.com", "spotify.com"] },
  github: { label: "GitHub", icon: siGithub, hosts: ["github.com"] },
} as const;

export type PlatformKey = keyof typeof PLATFORMS | "custom";

export function detectPlatform(url: string): PlatformKey {
  let host: string;
  try {
    host = new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return "custom";
  }
  for (const [key, p] of Object.entries(PLATFORMS)) {
    if (p.hosts.some((h) => host === h || host.endsWith(`.${h}`))) return key as PlatformKey;
  }
  return "custom";
}

export function platformLabel(key: string) {
  return key in PLATFORMS ? PLATFORMS[key as keyof typeof PLATFORMS].label : "Link";
}

export function PlatformIcon({ platform, className }: { platform: string; className?: string }) {
  if (!(platform in PLATFORMS)) return <Link2 className={className} aria-hidden="true" />;
  const icon = PLATFORMS[platform as keyof typeof PLATFORMS].icon;
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
      <path d={icon.path} />
    </svg>
  );
}
