import { createFileRoute, notFound, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ProfileStage } from "@/components/ProfileStage";
import { supabase } from "@/integrations/supabase/client";
import { getPublicProfile } from "@/lib/profiles.functions";
import { ProfileCard } from "@/components/ProfileCard";

export const Route = createFileRoute("/$username")({
  loader: async ({ params }) => {
    const profile = await getPublicProfile({ data: { username: params.username } });
    if (!profile) throw notFound();
    return profile;
  },
  head: ({ loaderData }) => {
    if (!loaderData) return { meta: [{ title: "Not found | tether.bio" }, { name: "robots", content: "noindex" }] };
    const name = loaderData.display_name || loaderData.username;
    const desc = loaderData.bio || `${name}'s links on tether.bio`;
    const meta = [
      { title: `${name} (@${loaderData.username}) | tether.bio` },
      { name: "description", content: desc },
      { property: "og:title", content: `${name} on tether.bio` },
      { property: "og:description", content: desc },
      { property: "og:type", content: "profile" },
      { name: "twitter:card", content: loaderData.avatar_url ? "summary" : "summary" },
    ];
    if (loaderData.avatar_url?.startsWith("https://")) {
      meta.push({ property: "og:image", content: loaderData.avatar_url }, { name: "twitter:image", content: loaderData.avatar_url });
    }
    return { meta };
  },
  notFoundComponent: NotFound,
  component: ProfilePage,
});

function ProfilePage() {
  const profile = Route.useLoaderData();
  const [entered, setEntered] = useState(!profile.enter_splash);
  useEffect(() => {
    supabase.rpc("record_view", { _username: profile.username }).then(({ error }) => {
      if (error) console.error("view not recorded", error.message);
    });
  }, [profile.username]);

  return (
    <ProfileStage color={profile.background_color} image={profile.background_url} className="min-h-screen flex-col px-6 py-16">
      {entered ? (
        <>
          <div className="w-full max-w-sm animate-in fade-in duration-500"><ProfileCard profile={profile} /></div>
          <Link to="/" className="mt-8 font-mono text-xs text-foreground/50 hover:text-foreground">tether.bio</Link>
        </>
      ) : (
        <button type="button" onClick={() => setEntered(true)} className="absolute inset-0 flex items-center justify-center bg-background/60 backdrop-blur-md focus-visible:outline-none">
          <span className="font-mono text-sm tracking-widest text-foreground/80">click to enter</span>
        </button>
      )}
    </ProfileStage>
  );
}

function NotFound() {
  const { username } = Route.useParams();
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
      <p className="font-mono text-sm text-muted-foreground">tether.bio/{username}</p>
      <h1 className="mt-3 text-2xl font-semibold">Nobody has this name yet</h1>
      <Link to="/signup" search={{ username }} className="mt-6 text-sm underline underline-offset-4">Claim it</Link>
    </main>
  );
}
