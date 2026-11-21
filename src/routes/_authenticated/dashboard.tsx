import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useState, type ReactNode } from "react";
import { toast } from "sonner";
import { ArrowDown, ArrowUp, AudioLines, Copy, ExternalLink, Palette, Link2, SlidersHorizontal, Trash2, UserRound, Check } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import { detectPlatform, PlatformIcon, platformLabel } from "@/lib/platforms";
import { ProfileCard } from "@/components/ProfileCard";
import { ProfileStage } from "@/components/ProfileStage";
import { DOMAIN, Wordmark } from "@/components/SiteHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { CustomizationPanel, Section } from "@/components/CustomizationPanel";
import { customizationSchema, readCustomization, DEFAULT_CUSTOMIZATION } from "@/lib/customization";

type Profile = Database["public"]["Tables"]["profiles"]["Row"];
type LinkRow = Database["public"]["Tables"]["links"]["Row"];

const PRESET_BACKGROUNDS = ["/images/bg-vexa.jpg", "/images/bg-kairo.jpg", "/images/bg-rain.jpg"];

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
  const [saved, setSaved] = useState<Profile | null>(null);
  const [links, setLinks] = useState<LinkRow[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [newUrl, setNewUrl] = useState("");
  const [previewSize, setPreviewSize] = useState<"desktop" | "mobile">("desktop");
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase.from("profiles").select("*").eq("user_id", userId).maybeSingle();
      if (error || !data) { setLoadError(error?.message ?? "Profile not found"); return; }
      setProfile(data);
      setSaved(data);
      const { data: l, error: le } = await supabase.from("links").select("*").eq("profile_id", data.id).order("position");
      if (le) { setLoadError(le.message); return; }
      setLinks(l ?? []);
    })();
  }, [userId]);

  if (loadError) return <p className="p-10 text-sm text-destructive">Couldn't load your profile: {loadError}</p>;
  if (!profile) return <p className="p-10 font-mono text-sm text-muted-foreground">Loading...</p>;

  const dirty = JSON.stringify(profile) !== JSON.stringify(saved);
  const set = <K extends keyof Profile>(k: K, v: Profile[K]) => setProfile({ ...profile, [k]: v });
  const publicUrl = `${DOMAIN}/${profile.username}`;
  const customization = readCustomization(profile.customization);

  async function save() {
    if (!profile) return;
    const checked = customizationSchema.safeParse(profile.customization);
    if (!checked.success) { toast.error("Check your customization settings before saving"); return; }
    setSaving(true);
    const { error } = await supabase.from("profiles").update({
      display_name: profile.display_name.slice(0, 40),
      bio: profile.bio.slice(0, 160),
      status: profile.status?.trim() || null,
      location: profile.location?.trim() || null,
      avatar_url: profile.avatar_url || null,
      background_url: profile.background_url || null,
      background_color: profile.background_color,
      card_opacity: profile.card_opacity,
      card_blur: profile.card_blur,
      enter_splash: profile.enter_splash,
      discord_tag: profile.discord_tag || null,
      steam_id: profile.steam_id || null,
      show_views: profile.show_views,
      customization: checked.data,
    }).eq("id", profile.id);
    setSaving(false);
    if (error) { toast.error(error.message); return; }
    setSaved(profile);
    toast.success("Saved");
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
    const a = links[i], b = links[j];
    if (!a || !b) return;
    const next = [...links];
    next[i] = b;
    next[j] = a;
    setLinks(next.map((l, idx) => ({ ...l, position: idx })));
    const results = await Promise.all(
      [{ id: b.id, position: i }, { id: a.id, position: j }].map((l) => supabase.from("links").update({ position: l.position }).eq("id", l.id)),
    );
    const failed = results.find((r) => r.error);
    if (failed?.error) toast.error(failed.error.message);
  }

  async function copyUrl() {
    try { await navigator.clipboard.writeText(`https://${publicUrl}`); toast.success("Link copied"); }
    catch { toast.error("Couldn't copy. Select the link and copy it manually."); }
  }

  async function signOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/login", replace: true });
  }

  const completeness = [profile.display_name, profile.bio, profile.avatar_url, profile.background_url, links.length > 0, profile.discord_tag || profile.steam_id].filter(Boolean).length;

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-30 border-b bg-background/85 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-6">
          <Wordmark />
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={copyUrl} className="font-mono"><Copy />{publicUrl}</Button>
            <Button asChild variant="outline" size="sm"><Link to="/$username" params={{ username: profile.username }} target="_blank"><ExternalLink />View</Link></Button>
            <Button variant="ghost" size="sm" onClick={signOut}>Log out</Button>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-7xl gap-10 px-4 pb-28 pt-8 sm:px-6 lg:grid-cols-[1fr_460px]">
        <div className="min-w-0">
          <div className="mb-8">
            <p className="mb-2 font-mono text-xs text-muted-foreground">YOUR SPACE / {profile.username}</p>
            <div className="flex flex-wrap items-center justify-between gap-4"><h1 className="text-3xl font-semibold">Profile studio</h1><Button onClick={save} disabled={saving || !dirty} size="sm"><Check />{saving ? "Saving…" : "Save changes"}</Button></div>
          </div>

          <dl className="mb-8 grid grid-cols-3 divide-x border-y">
            <Stat label="Page views" value={profile.views.toLocaleString("en")} />
            <Stat label="Links" value={String(links.length)} />
            <Stat label="Profile setup" value={`${completeness}/6`} />
          </dl>

          <Tabs defaultValue="profile">
            <TabsList className="mb-4 h-auto w-full flex-wrap justify-start gap-1 bg-transparent p-0">
              <TabsTrigger value="profile" className="gap-2 py-2.5"><UserRound className="size-3.5" />Profile</TabsTrigger>
              <TabsTrigger value="appearance" className="gap-2 py-2.5"><Palette className="size-3.5" />Design</TabsTrigger>
              <TabsTrigger value="effects" className="gap-2 py-2.5"><SlidersHorizontal className="size-3.5" />Effects</TabsTrigger>
              <TabsTrigger value="audio" className="gap-2 py-2.5"><AudioLines className="size-3.5" />Audio</TabsTrigger>
              <TabsTrigger value="links" className="gap-2 py-2.5"><Link2 className="size-3.5" />Links <span className="font-mono text-xs text-muted-foreground">{links.length}</span></TabsTrigger>
            </TabsList>

            <TabsContent value="profile" className="space-y-5">
              <Panel title="Basics">
                <div className="grid gap-5 sm:grid-cols-2">
                  <Field id="dn" label="Display name"><Input id="dn" maxLength={40} value={profile.display_name} onChange={(e) => set("display_name", e.target.value)} /></Field>
                  <Field id="loc" label="Location"><Input id="loc" maxLength={40} placeholder="Berlin" value={profile.location ?? ""} onChange={(e) => set("location", e.target.value)} /></Field>
                </div>
                <Field id="status" label="Status line"><Input id="status" maxLength={60} placeholder="probably listening to music" value={profile.status ?? ""} onChange={(e) => set("status", e.target.value)} /></Field>
                <Field id="bio" label="Bio" hint={`${profile.bio.length}/160`}><Textarea id="bio" maxLength={160} rows={3} value={profile.bio} onChange={(e) => set("bio", e.target.value)} /></Field>
                <Field id="av" label="Avatar image URL"><Input id="av" placeholder="https://..." value={profile.avatar_url ?? ""} onChange={(e) => set("avatar_url", e.target.value)} /></Field>
              </Panel>
              <Panel title="Handles">
                <div className="grid gap-5 sm:grid-cols-2">
                  <Field id="dc" label="Discord username"><Input id="dc" maxLength={40} value={profile.discord_tag ?? ""} onChange={(e) => set("discord_tag", e.target.value)} /></Field>
                  <Field id="st" label="Steam friend code"><Input id="st" maxLength={40} value={profile.steam_id ?? ""} onChange={(e) => set("steam_id", e.target.value)} /></Field>
                </div>
              </Panel>
            </TabsContent>

            <TabsContent value="appearance" className="space-y-5">
              <Panel title="Background">
                <div className="grid grid-cols-4 gap-3">
                  <BgOption active={!profile.background_url} onClick={() => set("background_url", null)} label="Solid color">
                    <span className="size-full" style={{ backgroundColor: profile.background_color }} />
                  </BgOption>
                  {PRESET_BACKGROUNDS.map((src, i) => (
                    <BgOption key={src} active={profile.background_url === src} onClick={() => set("background_url", src)} label={["Mountain background", "Forest background", "Rain background"][i] ?? "Preset background"}>
                      <img src={src} alt="" className="size-full object-cover" />
                    </BgOption>
                  ))}
                </div>
                <div className="grid gap-5 sm:grid-cols-[1fr_140px]">
                  <Field id="bg" label="Or your own image URL"><Input id="bg" placeholder="https://..." value={profile.background_url ?? ""} onChange={(e) => set("background_url", e.target.value)} /></Field>
                  <Field id="bgc" label="Base color"><Input id="bgc" type="color" className="h-9 p-1" value={profile.background_color} onChange={(e) => set("background_color", e.target.value)} /></Field>
                </div>
              </Panel>
              <Panel title="Card">
                <Field id="op" label="Card opacity" hint={`${profile.card_opacity}%`}>
                  <Slider id="op" min={0} max={100} step={5} value={[profile.card_opacity]} onValueChange={([v]) => set("card_opacity", v ?? 70)} />
                </Field>
                <Toggle id="blur" label="Blur what's behind the card" checked={profile.card_blur} onChange={(v) => set("card_blur", v)} />
              </Panel>
              <CustomizationPanel mode="design" value={customization} onChange={v => set("customization", v)} />
              <Button variant="outline" onClick={() => set("customization", { ...DEFAULT_CUSTOMIZATION })}>Reset custom styling</Button>
            </TabsContent>

            <TabsContent value="effects">
              <CustomizationPanel mode="effects" value={customization} onChange={v => set("customization", v)} />
              <Panel title="Visibility">
                <Toggle id="splash" label="Show a click-to-enter screen first" checked={profile.enter_splash} onChange={(v) => set("enter_splash", v)} />
                <Toggle id="sv" label="Show view count" checked={profile.show_views} onChange={(v) => set("show_views", v)} />
              </Panel>
            </TabsContent>

            <TabsContent value="audio"><CustomizationPanel mode="audio" value={customization} onChange={v => set("customization", v)} /></TabsContent>

            <TabsContent value="links" className="space-y-5">
              <Panel title="Add a link">
                <form onSubmit={addLink} className="flex gap-2">
                  <Label htmlFor="nl" className="sr-only">New link URL</Label>
                  <div className="relative flex-1">
                    <PlatformIcon platform={detectPlatform(/^https?:\/\//.test(newUrl) ? newUrl : `https://${newUrl}`)} className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input id="nl" className="pl-9" placeholder="instagram.com/yourname" value={newUrl} onChange={(e) => setNewUrl(e.target.value)} />
                  </div>
                  <Button type="submit" disabled={!newUrl.trim()}>Add</Button>
                </form>
              </Panel>
              {links.length === 0 ? (
                <p className="border-y border-dashed py-8 text-center text-sm text-muted-foreground">No links yet</p>
              ) : (
                <ul className="divide-y rounded-xl border">
                  {links.map((l, i) => (
                    <li key={l.id} className="flex items-center gap-3 px-4 py-3">
                      <div className="grid size-9 shrink-0 place-items-center rounded-md border bg-secondary"><PlatformIcon platform={l.platform} className="size-4" /></div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium">{platformLabel(l.platform)}</p>
                        <p className="truncate font-mono text-xs text-muted-foreground">{l.url}</p>
                      </div>
                      <Button size="icon" variant="ghost" aria-label="Move up" disabled={i === 0} onClick={() => move(i, -1)}><ArrowUp /></Button>
                      <Button size="icon" variant="ghost" aria-label="Move down" disabled={i === links.length - 1} onClick={() => move(i, 1)}><ArrowDown /></Button>
                      <Button size="icon" variant="ghost" aria-label="Remove link" onClick={() => removeLink(l.id)}><Trash2 /></Button>
                    </li>
                  ))}
                </ul>
              )}
            </TabsContent>
          </Tabs>
        </div>

        <aside aria-label="Preview" className="lg:sticky lg:top-20 lg:self-start">
          <div className="mb-4 flex items-center justify-between"><span className="font-mono text-xs text-muted-foreground">PREVIEW</span><div className="flex gap-1"><Button size="sm" variant={previewSize === "desktop" ? "secondary" : "ghost"} onClick={() => setPreviewSize("desktop")}>Wide</Button><Button size="sm" variant={previewSize === "mobile" ? "secondary" : "ghost"} onClick={() => setPreviewSize("mobile")}>Phone</Button></div></div>
          <div className={cn("mx-auto overflow-hidden rounded-lg border", previewSize === "mobile" && "max-w-[360px]")}>
            <div className="flex items-center justify-between border-b bg-card px-4 py-2.5">
              <span className="font-mono text-xs text-muted-foreground">{publicUrl}</span>
              <span className={cn("font-mono text-[11px]", dirty ? "text-foreground" : "text-muted-foreground")}>{dirty ? "unsaved" : "live"}</span>
            </div>
            <ProfileStage color={profile.background_color} image={profile.background_url} customization={customization} className="min-h-[620px] px-5 py-10">
              <ProfileCard profile={{ ...profile, links }} />
            </ProfileStage>
          </div>
        </aside>
      </div>

      {dirty && (
        <div className="fixed inset-x-0 bottom-6 z-40 flex justify-center px-4">
          <div role="status" className="flex max-w-full items-center gap-2 rounded-lg border bg-card py-2 pl-3 pr-2 shadow-lg sm:gap-4 sm:pl-5">
            <span className="text-xs sm:text-sm">Unsaved changes</span>
            <Button variant="ghost" size="sm" onClick={() => setProfile(saved)}>Discard</Button>
            <Button size="sm" onClick={save} disabled={saving}>{saving ? "Saving..." : "Save"}</Button>
          </div>
        </div>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return <div className="px-5 py-4"><dt className="text-xs text-muted-foreground">{label}</dt><dd className="mt-1 font-mono text-xl">{value}</dd></div>;
}

function Panel({ title, children }: { title: string; children: ReactNode }) {
  return <Section title={title}>{children}</Section>;
}

function Field({ id, label, hint, children }: { id: string; label: string; hint?: string; children: ReactNode }) {
  return (
    <div className="space-y-2">
      <div className="flex justify-between"><Label htmlFor={id}>{label}</Label>{hint && <span className="font-mono text-xs text-muted-foreground">{hint}</span>}</div>
      {children}
    </div>
  );
}

function Toggle({ id, label, checked, onChange }: { id: string; label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <Label htmlFor={id} className="font-normal">{label}</Label>
      <Switch id={id} checked={checked} onCheckedChange={onChange} />
    </div>
  );
}

function BgOption({ active, onClick, label, children }: { active: boolean; onClick: () => void; label: string; children: ReactNode }) {
  return (
    <Button type="button" variant="ghost" aria-label={label} aria-pressed={active} onClick={onClick}
      className={cn("flex h-auto aspect-video overflow-hidden rounded-md border-2 p-0 transition-colors", active ? "border-foreground" : "border-transparent hover:border-foreground/30")}>
      {children}
    </Button>
  );
}
