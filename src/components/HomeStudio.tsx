import { useState } from "react";
import { Check, RotateCcw } from "lucide-react";
import { ProfileCard, type CardProfile } from "@/components/ProfileCard";
import { ProfileStage } from "@/components/ProfileStage";
import { CustomizationPanel } from "@/components/CustomizationPanel";
import { DEFAULT_CUSTOMIZATION, type Customization } from "@/lib/customization";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const PERSONAL_DEMO: CardProfile = {
  username: "noa", display_name: "noa", bio: "film photos, late-night playlists & games with friends.",
  avatar_url: null, discord_tag: "noa.jpg", steam_id: null, status: "somewhere between songs", location: "London",
  show_views: true, views: 2048, card_opacity: 60, card_blur: true,
  links: [{ id: "noa-ig", platform: "instagram", url: "https://www.instagram.com/" }, { id: "noa-sp", platform: "spotify", url: "https://open.spotify.com/" }, { id: "noa-dc", platform: "discord", url: "https://discord.com/" }],
};

export const STYLE_PRESETS: { name: string; image: string; settings: Customization }[] = [
  { name: "After hours", image: "/images/bg-rain.jpg", settings: { ...DEFAULT_CUSTOMIZATION, accent: "ice", font: "mono", effect: "rain", radius: 8, backgroundDim: 25 } },
  { name: "Quiet place", image: "/images/bg-kairo.jpg", settings: { ...DEFAULT_CUSTOMIZATION, accent: "mint", font: "serif", linkStyle: "rows", avatarShape: "square", radius: 0, backgroundDim: 15 } },
  { name: "Soft focus", image: "/images/bg-vexa.jpg", settings: { ...DEFAULT_CUSTOMIZATION, accent: "rose", radius: 24, effect: "snow", backgroundDim: 15 } },
];

export function HomeStudio() {
  const first = STYLE_PRESETS[0];
  const [settings, setSettings] = useState(first?.settings ?? DEFAULT_CUSTOMIZATION);
  const [image, setImage] = useState(first?.image ?? "/images/bg-rain.jpg");
  return <section id="features" className="mx-auto max-w-6xl scroll-mt-20 px-5 py-16 sm:px-6 lg:py-20">
    <div className="mb-8 flex flex-wrap items-end justify-between gap-5"><div><p className="font-mono text-xs text-muted-foreground">01 / MAKE IT PERSONAL</p><h2 className="mt-3 text-3xl font-semibold sm:text-4xl">Your taste. Every detail.</h2></div><span className="font-mono text-xs text-muted-foreground">LIVE CUSTOMIZATION</span></div>
    <div className="grid gap-8 lg:grid-cols-[1.1fr_1fr] lg:gap-12">
      <div>
        <ProfileStage color="var(--background)" image={image} customization={settings} className="min-h-[600px] rounded-lg px-5 py-12"><ProfileCard profile={{ ...PERSONAL_DEMO, customization: settings }} /></ProfileStage>
        <div className="mt-3 grid grid-cols-3 gap-3">{STYLE_PRESETS.map(p => <Button key={p.name} variant="outline" onClick={() => { setSettings(p.settings); setImage(p.image); }} className="h-auto min-w-0 flex-col gap-2 overflow-hidden p-0 pb-3" aria-pressed={image === p.image}><img src={p.image} alt="" loading="lazy" className="h-16 w-full object-cover" /><span className="flex items-center gap-1 text-xs">{image === p.image && <Check className="size-3" />}{p.name}</span></Button>)}</div>
      </div>
      <div className="min-w-0">
        <Tabs defaultValue="design"><div className="flex items-center justify-between"><TabsList><TabsTrigger value="design">Design</TabsTrigger><TabsTrigger value="effects">Effects</TabsTrigger></TabsList><Button variant="ghost" size="icon" title="Reset preview" aria-label="Reset preview" onClick={() => { setSettings(first?.settings ?? DEFAULT_CUSTOMIZATION); setImage(first?.image ?? "/images/bg-rain.jpg"); }}><RotateCcw /></Button></div><TabsContent value="design"><CustomizationPanel mode="design" value={settings} onChange={setSettings} /></TabsContent><TabsContent value="effects"><CustomizationPanel mode="effects" value={settings} onChange={setSettings} /></TabsContent></Tabs>
      </div>
    </div>
  </section>;
}