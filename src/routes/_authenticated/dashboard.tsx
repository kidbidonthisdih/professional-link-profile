import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ArrowDown, ArrowUp, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import { detectPlatform, PlatformIcon, platformLabel } from "@/lib/platforms";
import { ProfileCard } from "@/components/ProfileCard";
import { DOMAIN, Wordmark } from "@/components/SiteHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";

type Profile = Database["public"]["Tables"]["profiles"]["Row"];
type LinkRow = Database["public"]["Tables"]["links"]["Row"];

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard | tether.bio" },
      { name: "description", content: "Edit your tether.bio profile and links." },
      { property: "og:title", content: "Dashboard | tether.bio" },
      { property: "og:description", content: "Edit your tether.bio profile and links." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const { userId } = Route.useRouteContext();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [links, setLinks] = useState<LinkRow[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [newUrl, setNewUrl] = useState("");
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase.from("profiles").select("*").eq("user_id", userId).maybeSingle();
      if (error || !data) return setLoadError(error?.message ?? "Profile not found");
      setProfile(data);
      const { data: l, error: le } = await supabase.from("links").select("*").eq("profile_id", data.id).order("position");
      if (le) return setLoadError(le.message);
      setLinks(l ?? []);
    })();
  }, [userId]);

  if (loadError) return <p className="p-10 text-sm text-destructive">Couldn't load your profile: {loadError}</p>;
  if (!profile) return <p className="p-10 font-mono text-sm text-muted-foreground">Loading...</p>;

  const set = <K extends keyof Profile>(k: K, v: Profile[K]) => setProfile({ ...profile, [k]: v });

  async function save() {
    if (!profile) return;
    setSaving(true);
    const { error } = await supabase.from("profiles").update({
      display_name: profile.display_name.slice(0, 40),
      bio: profile.bio.slice(0, 160),
      avatar_url: profile.avatar_url || null,
      background_url: profile.background_url || null,
      background_color: profile.background_color,
      discord_tag: profile.discord_tag || null,
      steam_id: profile.steam_id || null,
      show_views: profile.show_views,
    }).eq("id", profile.id);
    setSaving(false);
    if (error) toast.error(error.message);
    else toast.success("Saved");
  }

  async function addLink(e: React.FormEvent) {
    e.preventDefault();
    if (!profile) return;
    let url = newUrl.trim();
    if (!/^https?:\/\//.test(url)) url = `https://${url}`;
    try { new URL(url); } catch { toast.error("That doesn't look like a link"); return; }
    const { data, error } = await supabase.from("links")
      .insert({ profile_id: profile.id, url, platform: detectPlatform(url), position: links.length })
      .select().single();
    if (error) { toast.error(error.message); return; }
    setLinks([...links, data]);
    setNewUrl("");
  }

  async function removeLink(id: string) {
    const { error } = await supabase.from("links").delete().eq("id", id);
    if (error) { toast.error(error.message); return; }
    setLinks(links.filter((l) => l.id !== id));
  }

  async function move(i: number, dir: -1 | 1) {
    const j = i + dir;
    if (j < 0 || j >= links.length) return;
    const a = links[i], b = links[j];
    if (!a || !b) return;
    const next = [...links];
    next[i] = b;
    next[j] = a;
    const withPos = next.map((l, idx) => ({ ...l, position: idx }));
    setLinks(withPos);
    const results = await Promise.all(
      [{ ...b, position: i }, { ...a, position: j }].map((l) => supabase.from("links").update({ position: l.position }).eq("id", l.id)),
    );
    const failed = results.find((r) => r.error);
    if (failed?.error) toast.error(failed.error.message);
  }

  async function signOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/login", replace: true });
  }

  return (
    <div className="min-h-screen">
      <header className="flex h-16 items-center justify-between border-b px-6">
        <Wordmark />
        <div className="flex items-center gap-2">
          <Button asChild variant="ghost" size="sm">
            <Link to="/$username" params={{ username: profile.username }} target="_blank">{DOMAIN}/{profile.username}</Link>
          </Button>
          <Button variant="outline" size="sm" onClick={signOut}>Log out</Button>
        </div>
      </header>

      <div className="mx-auto grid max-w-6xl gap-10 px-6 py-10 lg:grid-cols-[1fr_420px]">
        <div className="space-y-10">
          <section aria-labelledby="profile-h" className="space-y-5">
            <h2 id="profile-h" className="text-sm font-medium text-muted-foreground">Profile</h2>
            <Field id="dn" label="Display name"><Input id="dn" maxLength={40} value={profile.display_name} onChange={(e) => set("display_name", e.target.value)} /></Field>
            <Field id="bio" label={`Bio (${profile.bio.length}/160)`}><Textarea id="bio" maxLength={160} rows={3} value={profile.bio} onChange={(e) => set("bio", e.target.value)} /></Field>
            <Field id="av" label="Avatar image URL"><Input id="av" placeholder="https://..." value={profile.avatar_url ?? ""} onChange={(e) => set("avatar_url", e.target.value)} /></Field>
            <div className="grid gap-5 sm:grid-cols-[1fr_140px]">
              <Field id="bg" label="Background image URL"><Input id="bg" placeholder="https://..." value={profile.background_url ?? ""} onChange={(e) => set("background_url", e.target.value)} /></Field>
              <Field id="bgc" label="Background color"><Input id="bgc" type="color" className="h-9 p-1" value={profile.background_color} onChange={(e) => set("background_color", e.target.value)} /></Field>
            </div>
            <div className="grid gap-5 sm:grid-cols-2">
              <Field id="dc" label="Discord username"><Input id="dc" maxLength={40} value={profile.discord_tag ?? ""} onChange={(e) => set("discord_tag", e.target.value)} /></Field>
              <Field id="st" label="Steam friend code"><Input id="st" maxLength={40} value={profile.steam_id ?? ""} onChange={(e) => set("steam_id", e.target.value)} /></Field>
            </div>
            <div className="flex items-center gap-3">
              <Switch id="sv" checked={profile.show_views} onCheckedChange={(v) => set("show_views", v)} />
              <Label htmlFor="sv">Show view count ({profile.views})</Label>
            </div>
            <Button onClick={save} disabled={saving}>{saving ? "Saving..." : "Save profile"}</Button>
          </section>

          <section aria-labelledby="links-h" className="space-y-4">
            <h2 id="links-h" className="text-sm font-medium text-muted-foreground">Links</h2>
            <form onSubmit={addLink} className="flex gap-2">
              <Label htmlFor="nl" className="sr-only">New link URL</Label>
              <Input id="nl" placeholder="twitch.tv/yourname" value={newUrl} onChange={(e) => setNewUrl(e.target.value)} />
              <Button type="submit" variant="secondary" disabled={!newUrl.trim()}>Add</Button>
            </form>
            {links.length === 0 ? (
              <p className="text-sm text-muted-foreground">No links yet. Paste your Twitch or YouTube URL above.</p>
            ) : (
              <ul className="divide-y rounded-md border">
                {links.map((l, i) => (
                  <li key={l.id} className="flex items-center gap-3 px-3 py-2">
                    <PlatformIcon platform={l.platform} className="size-4 shrink-0 text-muted-foreground" />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm">{platformLabel(l.platform)}</p>
                      <p className="truncate font-mono text-xs text-muted-foreground">{l.url}</p>
                    </div>
                    <Button size="icon" variant="ghost" aria-label="Move up" disabled={i === 0} onClick={() => move(i, -1)}><ArrowUp /></Button>
                    <Button size="icon" variant="ghost" aria-label="Move down" disabled={i === links.length - 1} onClick={() => move(i, 1)}><ArrowDown /></Button>
                    <Button size="icon" variant="ghost" aria-label="Remove link" onClick={() => removeLink(l.id)}><Trash2 /></Button>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>

        <aside aria-label="Preview" className="lg:sticky lg:top-10 lg:self-start">
          <p className="mb-3 text-sm font-medium text-muted-foreground">Preview</p>
          <div
            className="flex min-h-[560px] items-center justify-center rounded-lg border bg-cover bg-center p-6"
            style={{ backgroundColor: profile.background_color, backgroundImage: profile.background_url ? `url(${JSON.stringify(profile.background_url)})` : undefined }}
          >
            <ProfileCard profile={{ ...profile, links }} />
          </div>
        </aside>
      </div>
    </div>
  );
}

function Field({ id, label, children }: { id: string; label: string; children: React.ReactNode }) {
  return <div className="space-y-2"><Label htmlFor={id}>{label}</Label>{children}</div>;
}
