import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { getPublicProfile, getSiteStats } from "@/lib/profiles.functions";
import { ProfileCard, type CardProfile } from "@/components/ProfileCard";
import { ProfileStage } from "@/components/ProfileStage";
import { ClaimForm } from "@/components/ClaimForm";
import { DOMAIN, SiteHeader, Wordmark } from "@/components/SiteHeader";
import { PLATFORMS, PlatformIcon } from "@/lib/platforms";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "tether.bio | One link for your stream, socials and setup" },
      { name: "description", content: "Claim a profile link for Twitch, YouTube, Kick, Discord and Steam. Custom backgrounds, status, view counter. Free." },
      { property: "og:title", content: "tether.bio | One link for your stream, socials and setup" },
      { property: "og:description", content: "Claim a profile link for Twitch, YouTube, Kick, Discord and Steam." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  loader: async () => {
    const [vexa, kairo, stats] = await Promise.all([
      getPublicProfile({ data: { username: "vexa" } }),
      getPublicProfile({ data: { username: "kairo" } }),
      getSiteStats(),
    ]);
    return { vexa, kairo, stats };
  },
  component: Index,
});

const nf = new Intl.NumberFormat("en");

const SAMPLE_RAIN: CardProfile = {
  username: "m1dnight", display_name: "midnight", bio: "CS2 entry fragger. FACEIT lvl 10.",
  avatar_url: null, discord_tag: null, steam_id: null, status: "scrimming", location: null,
  show_views: false, views: 0, card_opacity: 45, card_blur: true,
  links: [{ id: "a", platform: "steam", url: "#" }, { id: "b", platform: "twitch", url: "#" }, { id: "c", platform: "x", url: "#" }],
};

const FAQ = [
  ["Is it free?", "Yes. Claiming a name, adding links and setting a background costs nothing, and there's no trial that runs out."],
  ["Can I change my username later?", "Not yet. Usernames are first come, first served, so pick the one you want to keep."],
  ["Which platforms get an icon?", "Twitch, YouTube, Kick, Discord, Steam, X, TikTok, Spotify and GitHub are detected from the URL. Anything else gets a plain link icon."],
  ["Does the view counter count my own visits?", "It counts every page open, yours included. You can hide the number from your page in the dashboard."],
] as const;

function Index() {
  const { vexa, kairo, stats } = Route.useLoaderData();
  return (
    <div className="min-h-screen overflow-x-hidden">
      <SiteHeader />

      {/* Hero */}
      <main className="mx-auto grid max-w-6xl items-center gap-14 px-6 pb-20 pt-20 lg:grid-cols-[1fr_1.05fr] lg:pt-28">
        <section>
          <p className="font-mono text-xs text-muted-foreground">{nf.format(stats.profiles)} names claimed</p>
          <h1 className="mt-4 text-6xl font-semibold leading-[0.95] tracking-tighter md:text-7xl">
            your link.<br /><span className="text-muted-foreground">one of one.</span>
          </h1>
          <p className="mt-6 max-w-md text-muted-foreground">
            Your stream, socials, Discord and Steam on one page with your own background. Drop it in your Twitch panel and TikTok bio.
          </p>
          <div className="mt-9 max-w-md"><ClaimForm /></div>
        </section>

        <section aria-label="Example profile" className="relative lg:[perspective:1800px]">
          <div className="overflow-hidden rounded-xl border bg-card lg:[transform:rotateY(-10deg)_rotateX(3deg)]">
            <div className="flex items-center gap-2 border-b px-4 py-2.5">
              <span className="size-2 rounded-full bg-foreground/20" /><span className="size-2 rounded-full bg-foreground/20" /><span className="size-2 rounded-full bg-foreground/20" />
              <span className="ml-3 rounded-sm bg-muted px-2 py-0.5 font-mono text-[11px] text-muted-foreground">{DOMAIN}/vexa</span>
            </div>
            {vexa && (
              <ProfileStage color={vexa.background_color} image={vexa.background_url} className="h-[520px] p-6">
                <ProfileCard profile={vexa} compact />
              </ProfileStage>
            )}
          </div>
        </section>
      </main>

      {/* Stats */}
      <section aria-label="Stats" className="border-y">
        <dl className="mx-auto grid max-w-6xl grid-cols-3 divide-x px-6">
          {[["profiles", stats.profiles], ["page views", stats.views], ["links added", stats.links]].map(([label, n]) => (
            <div key={label} className="py-8 text-center">
              <dd className="font-mono text-2xl md:text-3xl">{nf.format(Number(n))}</dd>
              <dt className="mt-1 text-xs text-muted-foreground">{label}</dt>
            </div>
          ))}
        </dl>
      </section>

      {/* Feature: backgrounds */}
      <section id="features" className="mx-auto max-w-6xl scroll-mt-24 px-6 py-24">
        <p className="font-mono text-xs text-muted-foreground">01 / backgrounds</p>
        <div className="mt-3 flex flex-wrap items-end justify-between gap-6">
          <h2 className="max-w-lg text-4xl font-semibold tracking-tight">Any wallpaper. Your card on top.</h2>
          <p className="max-w-sm text-sm text-muted-foreground">Paste an image link or pick a flat color, then set how see-through the card is. The preview updates while you type.</p>
        </div>
        <div className="mt-12 grid gap-4 md:grid-cols-3">
          {[
            { p: vexa, img: vexa?.background_url ?? null, color: vexa?.background_color ?? "#0a0a0a" },
            { p: kairo, img: kairo?.background_url ?? null, color: kairo?.background_color ?? "#0a0a0a" },
            { p: SAMPLE_RAIN, img: "/images/bg-rain.jpg", color: "#0a0a0a" },
          ].map(({ p, img, color }) => p && (
            <figure key={p.username} className="overflow-hidden rounded-xl border">
              <ProfileStage color={color} image={img} className="h-[420px] p-5"><ProfileCard profile={p} compact /></ProfileStage>
              <figcaption className="flex items-center justify-between border-t bg-card px-4 py-3 font-mono text-xs text-muted-foreground">
                /{p.username}<span>{p.card_opacity}% card</span>
              </figcaption>
            </figure>
          ))}
        </div>
      </section>

      {/* Feature: handles */}
      <section className="border-t">
        <div className="mx-auto grid max-w-6xl items-center gap-14 px-6 py-24 md:grid-cols-2">
          <div>
            <p className="font-mono text-xs text-muted-foreground">02 / handles and status</p>
            <h2 className="mt-3 text-4xl font-semibold tracking-tight">Stop typing your Discord in chat.</h2>
            <p className="mt-4 max-w-md text-sm text-muted-foreground">
              Your Discord username and Steam friend code sit on the card, ready to copy. Add a one-line status like "live on twitch" or "taking a break till monday".
            </p>
            <ul className="mt-8 space-y-3 text-sm">
              {["Status line, up to 60 characters", "Location, if you want it", "View counter you can hide", "Click-to-enter screen before your page opens"].map((t) => (
                <li key={t} className="flex items-center gap-3"><span className="h-px w-4 bg-foreground/40" />{t}</li>
              ))}
            </ul>
          </div>
          <div className="space-y-3">
            <Widget platform="discord" title="Discord" value="vexa.gg" meta="Add friend" />
            <Widget platform="steam" title="Steam" value="Friend code 418 220 917" meta="Copy" />
            <Widget platform="twitch" title="Twitch" value="twitch.tv/vexa" meta="Live weeknights 8pm CET" />
          </div>
        </div>
      </section>

      {/* Platforms marquee */}
      <section id="platforms" aria-label="Supported platforms" className="scroll-mt-24 border-y py-10">
        <p className="mb-8 text-center text-sm text-muted-foreground">Paste a URL. We pick the icon.</p>
        <div className="relative overflow-hidden [mask-image:linear-gradient(90deg,transparent,black_15%,black_85%,transparent)]">
          <ul className="flex w-max animate-marquee gap-10">
            {[...Object.entries(PLATFORMS), ...Object.entries(PLATFORMS), ...Object.entries(PLATFORMS), ...Object.entries(PLATFORMS)].map(([k, p], i) => (
              <li key={i} className="flex items-center gap-2.5 text-muted-foreground" aria-hidden={i >= Object.keys(PLATFORMS).length}>
                <PlatformIcon platform={k} className="size-5" /><span className="text-sm">{p.label}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="mx-auto grid max-w-6xl scroll-mt-24 gap-10 px-6 py-24 md:grid-cols-[1fr_1.5fr]">
        <h2 className="text-4xl font-semibold tracking-tight">Questions</h2>
        <Accordion type="single" collapsible>
          {FAQ.map(([q, a]) => (
            <AccordionItem key={q} value={q}>
              <AccordionTrigger className="text-left text-base">{q}</AccordionTrigger>
              <AccordionContent className="text-muted-foreground">{a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </section>

      {/* CTA */}
      <section className="px-6 pb-24">
        <div className="relative mx-auto max-w-6xl overflow-hidden rounded-2xl border">
          <img src="/images/bg-rain.jpg" alt="" aria-hidden="true" loading="lazy" className="absolute inset-0 size-full object-cover opacity-40" />
          <div className="relative px-8 py-20 text-center">
            <h2 className="text-4xl font-semibold tracking-tight md:text-5xl">Take your name before someone else does.</h2>
            <p className="mt-4 text-muted-foreground">Free. Takes about a minute.</p>
            <Button asChild size="lg" className="mt-8">
              <Link to="/signup" search={{ username: undefined }}>Claim {DOMAIN}/you <ArrowRight /></Link>
            </Button>
          </div>
        </div>
      </section>

      <footer className="border-t">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-6 py-8 text-sm text-muted-foreground">
          <Wordmark />
          <nav className="flex gap-6">
            <Link to="/login" className="hover:text-foreground">Log in</Link>
            <Link to="/$username" params={{ username: "vexa" }} className="hover:text-foreground">Example page</Link>
          </nav>
          <span className="font-mono text-xs">&copy; 2026 tether.bio</span>
        </div>
      </footer>
    </div>
  );
}

function Widget({ platform, title, value, meta }: { platform: string; title: string; value: string; meta: string }) {
  return (
    <div className="flex items-center gap-4 rounded-xl border bg-card p-4">
      <div className="grid size-11 place-items-center rounded-lg border bg-background"><PlatformIcon platform={platform} className="size-5" /></div>
      <div className="min-w-0 flex-1">
        <p className="text-xs text-muted-foreground">{title}</p>
        <p className="truncate font-mono text-sm">{value}</p>
      </div>
      <span className="rounded-md border px-2.5 py-1 text-xs text-muted-foreground">{meta}</span>
    </div>
  );
}
