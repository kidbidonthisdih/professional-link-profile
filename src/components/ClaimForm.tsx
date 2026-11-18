import { useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { validateUsername } from "@/lib/username";
import { Button } from "@/components/ui/button";
import { DOMAIN } from "./SiteHeader";

type Status = { kind: "idle" } | { kind: "checking" } | { kind: "free" } | { kind: "taken"; reason: string };

export function useUsernameStatus(name: string): Status {
  const [status, setStatus] = useState<Status>({ kind: "idle" });
  useEffect(() => {
    if (!name) return setStatus({ kind: "idle" });
    const local = validateUsername(name);
    if (!local.ok) return setStatus({ kind: "taken", reason: local.reason });
    setStatus({ kind: "checking" });
    let cancelled = false;
    const t = setTimeout(async () => {
      const { data, error } = await supabase.rpc("username_available", { _username: local.value });
      if (cancelled) return;
      if (error) setStatus({ kind: "taken", reason: "Couldn't check right now" });
      else setStatus(data ? { kind: "free" } : { kind: "taken", reason: "Already taken" });
    }, 300);
    return () => { cancelled = true; clearTimeout(t); };
  }, [name]);
  return status;
}

export function StatusLine({ status }: { status: Status }) {
  const text =
    status.kind === "checking" ? "Checking..." :
    status.kind === "free" ? "Available" :
    status.kind === "taken" ? status.reason : "\u00a0";
  const tone = status.kind === "free" ? "text-success" : status.kind === "taken" ? "text-destructive" : "text-muted-foreground";
  return <p aria-live="polite" className={`mt-2 font-mono text-xs ${tone}`}>{text}</p>;
}

export function ClaimForm() {
  const [name, setName] = useState("");
  const status = useUsernameStatus(name);
  const navigate = useNavigate();
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (status.kind === "free") navigate({ to: "/signup", search: { username: name.toLowerCase() } });
      }}
    >
      <label htmlFor="claim" className="sr-only">Username</label>
      <div className="flex rounded-md border bg-card focus-within:border-ring">
        <span className="flex items-center pl-4 font-mono text-sm text-muted-foreground">{DOMAIN}/</span>
        <input
          id="claim"
          value={name}
          onChange={(e) => setName(e.target.value.replace(/\s/g, ""))}
          placeholder="yourname"
          maxLength={20}
          autoComplete="off"
          spellCheck={false}
          className="min-w-0 flex-1 bg-transparent py-3 pr-2 font-mono text-sm outline-none placeholder:text-muted-foreground/50"
        />
        <Button type="submit" className="m-1" disabled={status.kind !== "free"}>Claim</Button>
      </div>
      <StatusLine status={status} />
    </form>
  );
}
