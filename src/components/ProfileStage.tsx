import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/** Background layer (color + optional image + darkening veil) that a profile card sits on. */
export function ProfileStage({ color, image, className, children }: { color: string; image: string | null; className?: string; children: ReactNode }) {
  return (
    <div className={cn("relative isolate flex items-center justify-center overflow-hidden", className)} style={{ backgroundColor: color }}>
      {image && <img src={image} alt="" aria-hidden="true" className="absolute inset-0 -z-10 size-full object-cover" />}
      {image && <div aria-hidden="true" className="absolute inset-0 -z-10 bg-background/35" />}
      {children}
    </div>
  );
}
