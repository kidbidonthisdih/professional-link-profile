import { ArrowUpRight, Check, Copy, Eye, MapPin } from "lucide-react";
import { useState } from "react";
import type { CSSProperties } from "react";
import { PlatformIcon, platformLabel } from "@/lib/platforms";
import { cn } from "@/lib/utils";
import { readCustomization } from "@/lib/customization";
import { ProfileMusic } from "@/components/ProfileMusic";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export type CardProfile = {
  username: string;
  display_name: string;
  bio: string;
  avatar_url: string | null;
  discord_tag: string | null;
  steam_id: string | null;
  status: string | null;
  location: string | null;
  show_views: boolean;
  views: number;
  card_opacity: number;
  card_blur: boolean;
  customization?: unknown;
  links: { id: string; platform: string; url: string }[];
};

const nf = new Intl.NumberFormat("en", { notation: "compact" });

export function ProfileCard({ profile, compact = false }: { profile: CardProfile; compact?: boolean }) {
  const name = profile.display_name || profile.username;
  const settings = readCustomization(profile.customization);
  const style: CSSProperties = {
    backgroundColor: `color-mix(in oklab, var(--card) ${profile.card_opacity}%, transparent)`,
    borderRadius: settings.radius,
    borderWidth: settings.border ? 1 : 0,
  };
  return (
    <article style={style} data-profile-card className={cn("profile-card w-full max-w-sm border-profile-accent/30", `profile-accent-${settings.accent}`, `profile-font-${settings.font}`, profile.card_blur && "backdrop-blur-xl", settings.alignment === "center" ? "text-center" : "text-left", compact ? "p-6" : "p-8")}>
      <div className={cn("relative w-fit", settings.alignment === "center" && "mx-auto")}>
        {profile.avatar_url ? (
          <img src={profile.avatar_url} alt="" style={{ width: settings.avatarSize, height: settings.avatarSize }} className={cn("border border-profile-accent/40 object-cover", settings.avatarShape === "circle" ? "rounded-full" : "rounded-md")} />
        ) : (
          <div aria-hidden="true" style={{ width: settings.avatarSize, height: settings.avatarSize }} className={cn("flex items-center justify-center border border-profile-accent/40 bg-secondary font-mono text-3xl text-profile-accent", settings.avatarShape === "circle" ? "rounded-full" : "rounded-md")}>
            {name.charAt(0).toUpperCase()}
          </div>
        )}
      </div>
      <h1 className={cn("mt-4 break-words font-semibold text-profile-accent", compact ? "text-xl" : "text-2xl")}>{name}</h1>
      <p className="mt-1 font-mono text-xs text-muted-foreground">@{profile.username}</p>
      {profile.status && (
        <p className={cn("mt-3 w-fit font-mono text-[11px] text-foreground/80", settings.alignment === "center" && "mx-auto")}>
          {profile.status}
        </p>
      )}
      {profile.bio && <p className="mt-4 text-sm leading-relaxed text-foreground/75">{profile.bio}</p>}

      {(profile.discord_tag || profile.steam_id) && (
        <dl className="mt-5 grid grid-cols-2 gap-2 text-left">
          {profile.discord_tag && <Handle label="Discord" platform="discord" value={profile.discord_tag} />}
          {profile.steam_id && <Handle label="Steam" platform="steam" value={profile.steam_id} />}
        </dl>
      )}

      {profile.links.length > 0 && (
        <ul className={cn("mt-5 gap-2", settings.linkStyle === "rows" ? "grid" : "flex flex-wrap", settings.alignment === "center" && "justify-center")}>
          {profile.links.map((l) => (
            <li key={l.id}>
              <a
                href={l.url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={platformLabel(l.platform)}
                title={platformLabel(l.platform)}
                className={cn("flex items-center rounded-md border border-profile-accent/20 bg-background/30 text-foreground/80 transition-colors hover:border-profile-accent hover:text-profile-accent focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring", settings.linkStyle === "rows" ? "min-h-11 gap-3 px-3 text-sm" : "size-10 justify-center")}
              >
                <PlatformIcon platform={l.platform} className="size-4" />
                {settings.linkStyle === "rows" && <><span className="flex-1 text-left">{platformLabel(l.platform)}</span><ArrowUpRight className="size-3.5 opacity-50" /></>}
              </a>
            </li>
          ))}
        </ul>
      )}

      {(profile.show_views || profile.location) && (
        <div className={cn("mt-5 flex flex-wrap items-center gap-4 font-mono text-[11px] text-muted-foreground", settings.alignment === "center" && "justify-center")}>
          {profile.location && <span className="inline-flex items-center gap-1"><MapPin className="size-3" aria-hidden="true" />{profile.location}</span>}
          {profile.show_views && <span className="inline-flex items-center gap-1"><Eye className="size-3" aria-hidden="true" />{nf.format(profile.views)}</span>}
        </div>
      )}
      <ProfileMusic settings={settings} />
    </article>
  );
}

function Handle({ label, platform, value }: { label: string; platform: string; value: string }) {
  const [copied, setCopied] = useState(false);
  async function copy() {
    try { await navigator.clipboard.writeText(value); setCopied(true); setTimeout(() => setCopied(false), 1800); }
    catch { toast.error("Couldn't copy this handle"); }
  }
  return (
    <div className="flex min-w-0 items-center gap-2 rounded-md border border-foreground/10 bg-background/30 px-2.5 py-2 [&:only-child]:col-span-2">
      <PlatformIcon platform={platform} className="size-3.5 shrink-0 text-foreground/70" />
      <div className="min-w-0">
        <dt className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</dt>
        <dd className="truncate font-mono text-xs">{value}</dd>
      </div>
      <Button size="icon" variant="ghost" className="ml-auto size-6 shrink-0" aria-label={`Copy ${label}`} title={`Copy ${label}`} onClick={copy}>{copied ? <Check className="size-3" /> : <Copy className="size-3" />}</Button>
    </div>
  );
}
