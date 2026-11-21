import { useState, type ReactNode } from "react";
import { Check, Music2, Type, Palette, CircleUserRound, SlidersHorizontal, CloudRain } from "lucide-react";
import { ACCENTS, customizationSchema, type Customization } from "@/lib/customization";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { cn } from "@/lib/utils";

export function CustomizationPanel({ mode, value, onChange }: { mode: "design" | "effects" | "audio"; value: Customization; onChange: (value: Customization) => void }) {
  const set = <K extends keyof Customization>(key: K, next: Customization[K]) => onChange({ ...value, [key]: next });
  if (mode === "audio") return <AudioSettings value={value} onChange={onChange} />;
  if (mode === "effects") return <>
    <Section title="Background treatment" icon={<SlidersHorizontal className="size-4" />}>
      <Range id="background-dim" label="Darken background" value={value.backgroundDim} max={85} suffix="%" onChange={v => set("backgroundDim", v)} />
      <Range id="background-blur" label="Background blur" value={value.backgroundBlur} max={16} suffix="px" onChange={v => set("backgroundBlur", v)} />
    </Section>
    <Section title="Atmosphere" icon={<CloudRain className="size-4" />}>
      <Choice label="Weather effect" value={value.effect} options={[["none", "None"], ["rain", "Rain"], ["snow", "Snow"]]} onChange={v => set("effect", v as Customization["effect"])} />
    </Section>
    <Section title="Entrance" icon={<Type className="size-4" />}>
      <Label htmlFor="entrance-text">Entrance message</Label>
      <Input id="entrance-text" maxLength={60} value={value.splashText} onChange={e => set("splashText", e.target.value)} />
    </Section>
  </>;
  return <>
    <Section title="Typography & color" icon={<Palette className="size-4" />}>
      <Choice label="Font" value={value.font} options={[["geist", "Geist"], ["mono", "Mono"], ["serif", "Serif"]]} onChange={v => set("font", v as Customization["font"])} />
      <div className="space-y-3"><Label>Accent color</Label><div className="flex gap-3">{ACCENTS.map(a => <Button key={a.value} variant="outline" size="icon" aria-label={a.label} title={a.label} aria-pressed={value.accent === a.value} onClick={() => set("accent", a.value)} className={cn("size-9", `profile-accent-${a.value}`, value.accent === a.value && "border-profile-accent")}><span className="flex size-5 items-center justify-center rounded-full bg-profile-accent text-background">{value.accent === a.value && <Check className="size-3" />}</span></Button>)}</div></div>
      <Choice label="Alignment" value={value.alignment} options={[["center", "Centered"], ["left", "Left aligned"]]} onChange={v => set("alignment", v as Customization["alignment"])} />
    </Section>
    <Section title="Avatar" icon={<CircleUserRound className="size-4" />}>
      <Choice label="Shape" value={value.avatarShape} options={[["circle", "Circle"], ["square", "Square"]]} onChange={v => set("avatarShape", v as Customization["avatarShape"])} />
      <Range id="avatar-size" label="Avatar size" value={value.avatarSize} min={64} max={120} suffix="px" onChange={v => set("avatarSize", v)} />
    </Section>
    <Section title="Card & links" icon={<SlidersHorizontal className="size-4" />}>
      <Range id="card-radius" label="Corner radius" value={value.radius} max={32} suffix="px" onChange={v => set("radius", v)} />
      <div className="flex items-center justify-between"><Label htmlFor="card-border">Card border</Label><Switch id="card-border" checked={value.border} onCheckedChange={v => set("border", v)} /></div>
      <Choice label="Link layout" value={value.linkStyle} options={[["icons", "Social icons"], ["rows", "Full-width links"]]} onChange={v => set("linkStyle", v as Customization["linkStyle"])} />
    </Section>
  </>;
}

function AudioSettings({ value, onChange }: { value: Customization; onChange: (v: Customization) => void }) {
  const [url, setUrl] = useState(value.musicUrl);
  const [error, setError] = useState("");
  function apply() {
    const result = customizationSchema.safeParse({ ...value, musicUrl: url.trim() });
    if (!result.success) { setError("Use a direct http or https audio URL."); return; }
    onChange(result.data); setError("");
  }
  return <Section title="Profile soundtrack" icon={<Music2 className="size-4" />}>
    <div className="space-y-2"><Label htmlFor="audio-url">Audio URL (.mp3, .ogg, .wav)</Label><div className="flex gap-2"><Input id="audio-url" value={url} placeholder="https://…/track.mp3" onChange={e => setUrl(e.target.value)} /><Button variant="outline" onClick={apply}>Set audio</Button></div>{error && <p role="alert" className="text-xs text-destructive">{error}</p>}</div>
    <div className="space-y-2"><Label htmlFor="track-title">Track title</Label><Input id="track-title" maxLength={80} value={value.musicTitle} onChange={e => onChange({ ...value, musicTitle: e.target.value })} /></div>
    <Range id="audio-volume" label="Default volume" value={value.musicVolume} max={100} suffix="%" onChange={v => onChange({ ...value, musicVolume: v })} />
    {value.musicUrl && <Button variant="outline" onClick={() => { setUrl(""); onChange({ ...value, musicUrl: "" }); }}>Remove audio</Button>}
  </Section>;
}

export function Section({ title, icon, children }: { title: string; icon?: ReactNode; children: ReactNode }) {
  return <section className="editor-panel py-6"><h2 className="mb-5 flex items-center gap-2 text-sm font-medium">{icon}<span>{title}</span></h2><div className="space-y-5">{children}</div></section>;
}

function Choice({ label, value, options, onChange }: { label: string; value: string; options: [string, string][]; onChange: (v: string) => void }) {
  return <div className="space-y-2"><Label>{label}</Label><ToggleGroup type="single" variant="outline" value={value} onValueChange={v => { if (v) onChange(v); }} className="w-full flex-wrap justify-start" aria-label={label}>{options.map(([key, text]) => <ToggleGroupItem key={key} value={key} className="min-w-20 flex-1 px-3">{text}</ToggleGroupItem>)}</ToggleGroup></div>;
}

function Range({ id, label, value, min = 0, max, suffix, onChange }: { id: string; label: string; value: number; min?: number; max: number; suffix: string; onChange: (v: number) => void }) {
  return <div className="space-y-3"><div className="flex justify-between"><Label htmlFor={id}>{label}</Label><span className="font-mono text-xs text-muted-foreground">{value}{suffix}</span></div><Slider id={id} min={min} max={max} step={1} value={[value]} onValueChange={v => { if (v[0] !== undefined) onChange(v[0]); }} /></div>;
}