import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { AuthShell } from "@/components/AuthShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Log in | tether.bio" },
      { name: "description", content: "Log in to edit your tether.bio page." },
      { property: "og:title", content: "Log in | tether.bio" },
      { property: "og:description", content: "Log in to edit your tether.bio page." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Login,
});

function Login() {
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);
  return (
    <AuthShell title="Log in" footer={<>No account? <Link to="/signup" search={{ username: undefined }} className="text-foreground underline underline-offset-4">Claim a username</Link></>}>
      <form
        className="space-y-4"
        onSubmit={async (e) => {
          e.preventDefault();
          const f = new FormData(e.currentTarget);
          setBusy(true);
          const { error } = await supabase.auth.signInWithPassword({ email: String(f.get("email")), password: String(f.get("password")) });
          setBusy(false);
          if (error) return toast.error(error.message);
          navigate({ to: "/dashboard" });
        }}
      >
        <div className="space-y-2"><Label htmlFor="email">Email</Label><Input id="email" name="email" type="email" required autoComplete="email" /></div>
        <div className="space-y-2"><Label htmlFor="password">Password</Label><Input id="password" name="password" type="password" required autoComplete="current-password" /></div>
        <Button type="submit" className="w-full" disabled={busy}>{busy ? "Logging in..." : "Log in"}</Button>
      </form>
    </AuthShell>
  );
}
