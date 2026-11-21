import type { CSSProperties, ReactNode } from "react";
import { cn } from "@/lib/utils";
import { readCustomization } from "@/lib/customization";

/** Background layer (color + optional image + darkening veil) that a profile card sits on. */
export function ProfileStage({ color, image, customization, className, children }: { color: string; image: string | null; customization?: unknown; className?: string; children: ReactNode }) {
  const settings = readCustomization(customization);
  return (
    <div className={cn("relative isolate flex items-center justify-center overflow-hidden", className)} style={{ backgroundColor: color }}>
      {image && <img src={image} alt="" aria-hidden="true" className="absolute inset-0 -z-20 size-full object-cover" style={{ filter: `blur(${settings.backgroundBlur}px)`, transform: settings.backgroundBlur ? "scale(1.08)" : undefined }} />}
      {image && <div aria-hidden="true" className="absolute inset-0 -z-10 bg-background" style={{ opacity: settings.backgroundDim / 100 }} />}
      {settings.effect !== "none" && <div aria-hidden="true" className={cn("profile-weather pointer-events-none absolute inset-0 z-10", `weather-${settings.effect}`)}>{Array.from({ length: 28 }, (_, i) => <span key={i} style={{ "--particle-x": `${(i * 37) % 100}%`, "--particle-delay": `${-(i % 9)}s`, "--particle-duration": `${settings.effect === "rain" ? 1 + (i % 4) / 3 : 6 + (i % 7)}s` } as CSSProperties} />)}</div>}
      {children}
    </div>
  );
}
