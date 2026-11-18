import { Eye } from "lucide-react";
import { PlatformIcon, platformLabel } from "@/lib/platforms";

export type CardProfile = {
  username: string;
  display_name: string;
  bio: string;
  avatar_url: string | null;
  discord_tag: string | null;
  steam_id: string | null;
  show_views: boolean;
  views: number;
  links: { id: string; platform: string; url: string }[];
};

const nf = new Intl.NumberFormat("en", { notation: "compact" });

export function ProfileCard({ profile }: { profile: CardProfile }) {
  const name = profile.display_name || profile.username;
  return (
    <article className="w-full max-w-sm rounded-lg border bg-card/90 p-8 text-center backdrop-blur-sm">
      {profile.avatar_url ? (
        <img src={profile.avatar_url} alt="" className="mx-auto size-24 rounded-full border object-cover" />
      ) : (
        <div aria-hidden="true" className="mx-auto flex size-24 items-center justify-center rounded-full border bg-secondary font-mono text-3xl text-muted-foreground">
          {name.charAt(0).toUpperCase()}
        </div>
      )}
      <h1 className="mt-5 text-2xl font-semibold tracking-tight">{name}</h1>
      <p className="mt-1 font-mono text-xs text-muted-foreground">@{profile.username}</p>
      {profile.bio && <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{profile.bio}</p>}

      {(profile.discord_tag || profile.steam_id) && (
        <dl className="mt-5 space-y-1 font-mono text-xs text-muted-foreground">
          {profile.discord_tag && (
            <div className="flex justify-center gap-2"><dt className="text-foreground/50">discord</dt><dd>{profile.discord_tag}</dd></div>
          )}
          {profile.steam_id && (
            <div className="flex justify-center gap-2"><dt className="text-foreground/50">steam</dt><dd>{profile.steam_id}</dd></div>
          )}
        </dl>
      )}

      {profile.links.length > 0 && (
        <ul className="mt-6 flex flex-wrap justify-center gap-2">
          {profile.links.map((l) => (
            <li key={l.id}>
              <a
                href={l.url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={platformLabel(l.platform)}
                className="flex size-10 items-center justify-center rounded-md border text-muted-foreground transition-colors hover:border-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                <PlatformIcon platform={l.platform} className="size-4" />
              </a>
            </li>
          ))}
        </ul>
      )}

      {profile.show_views && (
        <p className="mt-6 inline-flex items-center gap-1.5 font-mono text-xs text-muted-foreground">
          <Eye className="size-3.5" aria-hidden="true" /> {nf.format(profile.views)} views
        </p>
      )}
    </article>
  );
}
