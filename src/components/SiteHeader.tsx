import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";

export const DOMAIN = "tether.bio";

export function Wordmark() {
  return (
    <Link to="/" className="inline-flex items-center gap-2 font-mono text-sm font-medium tracking-tight">
      <span aria-hidden="true" className="grid size-5 place-items-center rounded-sm bg-foreground text-[11px] font-semibold text-background">t</span>
      tether<span className="-ml-2 text-muted-foreground">.bio</span>
    </Link>
  );
}

export function SiteHeader() {
  const [signedIn, setSignedIn] = useState<boolean | null>(null);
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSignedIn(!!data.session));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setSignedIn(!!s));
    return () => sub.subscription.unsubscribe();
  }, []);

  return (
    <div className="sticky top-4 z-40 px-4">
      <header className="mx-auto flex h-14 max-w-5xl items-center justify-between rounded-xl border bg-background/80 px-4 backdrop-blur-md">
        <Wordmark />
        <nav aria-label="Main" className="hidden items-center gap-6 text-sm text-muted-foreground md:flex">
          <a href="#features" className="hover:text-foreground">Features</a>
          <a href="#platforms" className="hover:text-foreground">Platforms</a>
          <a href="#faq" className="hover:text-foreground">FAQ</a>
        </nav>
        <div className="flex items-center gap-2">
          {signedIn ? (
            <Button asChild size="sm"><Link to="/dashboard">Dashboard</Link></Button>
          ) : (
            <>
              <Button asChild variant="ghost" size="sm"><Link to="/login">Log in</Link></Button>
              <Button asChild size="sm"><Link to="/signup" search={{ username: undefined }}>Claim yours</Link></Button>
            </>
          )}
        </div>
      </header>
    </div>
  );
}
