import { Eye, MapPin } from "lucide-react";
import type { CSSProperties } from "react";
import { PlatformIcon, platformLabel } from "@/lib/platforms";
import { cn } from "@/lib/utils";

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
  links: { id: string; platform: string; url: string }[];
};

const nf = new Intl.NumberFormat("en", { notation: "compact" });

export function ProfileCard({ profile, compact = false }: { profile: CardProfile; compact?: boolean }) {
  const name = profile.display_name || profile.username;
  const style: CSSProperties = {
    backgroundColor: `color-mix(in oklab, var(--card) ${profile.card_opacity}%, transparent)`,
  };
  return (
    <article style={style} className={cn("w-full max-w-sm rounded-xl border border-foreground/10 text-center", profile.card_blur && "backdrop-blur-xl", compact ? "p-6" : "p-8")}>
      <div className="relative mx-auto w-fit">
        {profile.avatar_url ? (
          <img src={profile.avatar_url} alt="" className={cn("rounded-full border border-foreground/15 object-cover", compact ? "size-20" : "size-24")} />
        ) : (
          <div aria-hidden="true" className={cn("flex items-center justify-center rounded-full border border-foreground/15 bg-secondary font-mono text-muted-foreground", compact ? "size-20 text-2xl" : "size-24 text-3xl")}>
            {name.charAt(0).toUpperCase()}
          </div>
        )}
      </div>
      <h1 className={cn("mt-4 font-semibold tracking-tight", compact ? "text-xl" : "text-2xl")}>{name}</h1>
      <p className="mt-1 font-mono text-xs text-muted-foreground">@{profile.username}</p>
      {profile.status && (
        <p className="mx-auto mt-3 w-fit rounded-md border border-foreground/10 bg-background/40 px-2.5 py-1 font-mono text-[11px] text-foreground/80">
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
        <ul className="mt-5 flex flex-wrap justify-center gap-2">
          {profile.links.map((l) => (
            <li key={l.id}>
              <a
                href={l.url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={platformLabel(l.platform)}
                className="flex size-10 items-center justify-center rounded-md border border-foreground/10 bg-background/30 text-foreground/70 transition-colors hover:border-foreground/60 hover:text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                <PlatformIcon platform={l.platform} className="size-4" />
              </a>
            </li>
          ))}
        </ul>
      )}

      {(profile.show_views || profile.location) && (
        <div className="mt-5 flex items-center justify-center gap-4 font-mono text-[11px] text-muted-foreground">
          {profile.location && <span className="inline-flex items-center gap-1"><MapPin className="size-3" aria-hidden="true" />{profile.location}</span>}
          {profile.show_views && <span className="inline-flex items-center gap-1"><Eye className="size-3" aria-hidden="true" />{nf.format(profile.views)}</span>}
        </div>
      )}
    </article>
  );
}

function Handle({ label, platform, value }: { label: string; platform: string; value: string }) {
  return (
    <div className="flex min-w-0 items-center gap-2 rounded-md border border-foreground/10 bg-background/30 px-2.5 py-2 [&:only-child]:col-span-2">
      <PlatformIcon platform={platform} className="size-3.5 shrink-0 text-foreground/70" />
      <div className="min-w-0">
        <dt className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</dt>
        <dd className="truncate font-mono text-xs">{value}</dd>
      </div>
    </div>
  );
}
