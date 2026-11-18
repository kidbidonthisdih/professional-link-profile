import type { ReactNode } from "react";
import { Wordmark } from "./SiteHeader";

export function AuthShell({ title, children, footer }: { title: string; children: ReactNode; footer: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <Wordmark />
        <h1 className="mt-8 text-2xl font-semibold tracking-tight">{title}</h1>
        <div className="mt-8">{children}</div>
        <p className="mt-6 text-sm text-muted-foreground">{footer}</p>
      </div>
    </div>
  );
}
