import { createFileRoute, notFound, Link } from "@tanstack/react-router";
import { useEffect } from "react";
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
  useEffect(() => {
    supabase.rpc("record_view", { _username: profile.username }).then(({ error }) => {
      if (error) console.error("view not recorded", error.message);
    });
  }, [profile.username]);

  return (
    <main
      className="flex min-h-screen flex-col items-center justify-center bg-cover bg-center px-6 py-16"
      style={{ backgroundColor: profile.background_color, backgroundImage: profile.background_url ? `url(${JSON.stringify(profile.background_url)})` : undefined }}
    >
      <ProfileCard profile={profile} />
      <Link to="/" className="mt-8 font-mono text-xs text-muted-foreground hover:text-foreground">tether.bio</Link>
    </main>
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
