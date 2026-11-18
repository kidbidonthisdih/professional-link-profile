import { Link, useRouter } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";

export const DOMAIN = "tether.bio";

export function Wordmark() {
  return <Link to="/" className="font-mono text-sm font-medium tracking-tight">tether<span className="text-muted-foreground">.bio</span></Link>;
}

export function SiteHeader() {
  const [signedIn, setSignedIn] = useState<boolean | null>(null);
  const router = useRouter();
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSignedIn(!!data.session));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setSignedIn(!!s));
    return () => sub.subscription.unsubscribe();
  }, [router]);

  return (
    <header className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
      <Wordmark />
      <nav className="flex items-center gap-2">
        {signedIn ? (
          <Button asChild size="sm"><Link to="/dashboard">Dashboard</Link></Button>
        ) : (
          <>
            <Button asChild variant="ghost" size="sm"><Link to="/login">Log in</Link></Button>
            <Button asChild size="sm"><Link to="/signup" search={{ username: undefined }}>Sign up</Link></Button>
          </>
        )}
      </nav>
    </header>
  );
}
