import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { AuthShell } from "@/components/AuthShell";
import { StatusLine, useUsernameStatus } from "@/components/ClaimForm";
import { DOMAIN } from "@/components/SiteHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/signup")({
  validateSearch: (s: Record<string, unknown>): { username?: string } => ({
    username: typeof s.username === "string" ? s.username.slice(0, 20) : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Claim your username | tether.bio" },
      { name: "description", content: "Create a tether.bio account and reserve your profile link." },
      { property: "og:title", content: "Claim your username | tether.bio" },
      { property: "og:description", content: "Create a tether.bio account and reserve your profile link." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Signup,
});

function Signup() {
  const search = Route.useSearch();
  const [username, setUsername] = useState(search.username ?? "");
  const status = useUsernameStatus(username);
  const [busy, setBusy] = useState(false);
  const [sentTo, setSentTo] = useState<string | null>(null);

  if (sentTo) {
    return (
      <AuthShell title="Check your inbox" footer={<Link to="/login" className="text-foreground underline underline-offset-4">Back to log in</Link>}>
        <p className="text-sm text-muted-foreground">We sent a confirmation link to <span className="text-foreground">{sentTo}</span>. Your username <span className="font-mono text-foreground">{username.toLowerCase()}</span> is reserved.</p>
      </AuthShell>
    );
  }

  return (
    <AuthShell title="Claim your username" footer={<>Already have one? <Link to="/login" className="text-foreground underline underline-offset-4">Log in</Link></>}>
      <form
        className="space-y-4"
        onSubmit={async (e) => {
          e.preventDefault();
          if (status.kind !== "free") return;
          const f = new FormData(e.currentTarget);
          const email = String(f.get("email"));
          setBusy(true);
          const { data, error } = await supabase.auth.signUp({
            email,
            password: String(f.get("password")),
            options: { emailRedirectTo: `${window.location.origin}/dashboard`, data: { username: username.toLowerCase() } },
          });
          setBusy(false);
          if (error) return toast.error(error.message.includes("Database") ? "That username was just taken. Try another." : error.message);
          if (data.session) window.location.assign("/dashboard");
          else setSentTo(email);
        }}
      >
        <div>
          <Label htmlFor="username">Username</Label>
          <div className="mt-2 flex rounded-md border bg-transparent focus-within:border-ring">
            <span className="flex items-center pl-3 font-mono text-sm text-muted-foreground">{DOMAIN}/</span>
            <input id="username" value={username} onChange={(e) => setUsername(e.target.value.replace(/\s/g, ""))} maxLength={20} required spellCheck={false} autoComplete="off" className="min-w-0 flex-1 bg-transparent py-2 pr-3 font-mono text-sm outline-none" />
          </div>
          <StatusLine status={status} />
        </div>
        <div className="space-y-2"><Label htmlFor="email">Email</Label><Input id="email" name="email" type="email" required autoComplete="email" /></div>
        <div className="space-y-2"><Label htmlFor="password">Password</Label><Input id="password" name="password" type="password" required minLength={8} autoComplete="new-password" /></div>
        <Button type="submit" className="w-full" disabled={busy || status.kind !== "free"}>{busy ? "Creating account..." : "Create account"}</Button>
      </form>
    </AuthShell>
  );
}
