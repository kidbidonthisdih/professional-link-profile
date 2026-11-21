import { useEffect, useRef, useState } from "react";
import { Music2, Pause, Play, Volume2, VolumeX } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Customization } from "@/lib/customization";

export function ProfileMusic({ settings }: { settings: Customization }) {
  const audio = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [error, setError] = useState(false);
  useEffect(() => {
    if (audio.current) audio.current.volume = settings.musicVolume / 100;
  }, [settings.musicVolume, settings.musicUrl]);
  useEffect(() => { setPlaying(false); setError(false); }, [settings.musicUrl]);
  if (!settings.musicUrl) return null;
  async function toggle() {
    if (!audio.current) return;
    if (playing) audio.current.pause();
    else {
      try { await audio.current.play(); }
      catch { setError(true); }
    }
  }
  return (
    <div className="profile-music mt-5 flex items-center gap-3 border-t border-current/15 pt-4 text-left">
      <audio ref={audio} src={settings.musicUrl} preload="none" loop muted={muted} onPlay={() => { setPlaying(true); setError(false); }} onPause={() => setPlaying(false)} onError={() => { setError(true); setPlaying(false); }} />
      <Music2 className="size-4 shrink-0 text-profile-accent" />
      <div className="min-w-0 flex-1"><p className="truncate text-xs">{settings.musicTitle || "On repeat"}</p><p className="mt-1 font-mono text-[10px] opacity-60" role="status">{error ? "Audio unavailable" : playing ? "Now playing" : "Paused"}</p></div>
      <Button size="icon" variant="ghost" aria-label={playing ? "Pause music" : "Play music"} title={playing ? "Pause music" : "Play music"} onClick={toggle}>{playing ? <Pause /> : <Play />}</Button>
      <Button size="icon" variant="ghost" aria-label={muted ? "Unmute music" : "Mute music"} title={muted ? "Unmute music" : "Mute music"} onClick={() => setMuted(!muted)}>{muted ? <VolumeX /> : <Volume2 />}</Button>
    </div>
  );
}