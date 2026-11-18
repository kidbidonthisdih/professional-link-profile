import { createFileRoute, Link } from "@tanstack/react-router";
import { getPublicProfile } from "@/lib/profiles.functions";
import { ProfileCard } from "@/components/ProfileCard";
import { ClaimForm } from "@/components/ClaimForm";
import { SiteHeader, Wordmark } from "@/components/SiteHeader";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "tether.bio | One link for your stream, socials and setup" },
      { name: "description", content: "Claim a short profile link for Twitch, YouTube, Kick, Discord and Steam. Free, fast, no clutter." },
      { property: "og:title", content: "tether.bio | One link for your stream, socials and setup" },
      { property: "og:description", content: "Claim a short profile link for Twitch, YouTube, Kick, Discord and Steam." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  loader: () => getPublicProfile({ data: { username: "vexa" } }),
  component: Index,
});

const FEATURES = [
  ["Platform detection", "Paste a Twitch, Kick or Steam URL and the right icon is picked for you."],
  ["Discord and Steam IDs", "Show your tag and friend code so people can add you without asking in chat."],
  ["View counter", "See how many people opened your page. Hide it if you'd rather not."],
  ["Your background", "Upload a wallpaper or pick a flat color. Nothing else competes with it."],
] as const;

function Index() {
  const demo = Route.useLoaderData();
  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="mx-auto grid max-w-6xl gap-16 px-6 pb-24 pt-16 md:grid-cols-[1.1fr_1fr] md:items-center md:pt-24">
        <section>
          <h1 className="text-4xl font-semibold leading-[1.05] tracking-tight md:text-6xl">
            Every link you stream with, on one page.
          </h1>
          <p className="mt-6 max-w-md text-muted-foreground">
            Put it in your Twitch panel, TikTok bio and Discord status. Set it up in under two minutes.
          </p>
          <div className="mt-10 max-w-md"><ClaimForm /></div>
          <p className="mt-2 text-sm text-muted-foreground">
            See a live one: <Link to="/$username" params={{ username: "vexa" }} className="font-mono text-foreground underline underline-offset-4">tether.bio/vexa</Link>
          </p>
        </section>
        <section aria-label="Example profile" className="flex justify-center rounded-lg border bg-muted/40 px-6 py-14">
          {demo && <ProfileCard profile={demo} />}
        </section>
      </main>

      <section className="border-t">
        <dl className="mx-auto grid max-w-6xl px-6 md:grid-cols-2">
          {FEATURES.map(([title, body]) => (
            <div key={title} className="border-b py-8 md:odd:pr-10 md:even:border-l md:even:pl-10">
              <dt className="font-medium">{title}</dt>
              <dd className="mt-2 text-sm text-muted-foreground">{body}</dd>
            </div>
          ))}
        </dl>
      </section>

      <footer className="mx-auto flex max-w-6xl items-center justify-between px-6 py-10 text-sm text-muted-foreground">
        <Wordmark />
        <span className="font-mono text-xs">&copy; 2026</span>
      </footer>
    </div>
  );
}
