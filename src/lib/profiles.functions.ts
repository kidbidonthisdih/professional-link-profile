import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

export type PublicLink = { id: string; platform: string; url: string; position: number };
export type PublicProfile = Database["public"]["Tables"]["profiles"]["Row"] & { links: PublicLink[] };

function publicClient() {
  const url = process.env["SUPABASE_URL"]!;
  const key = process.env["SUPABASE_PUBLISHABLE_KEY"]!;
  return createClient<Database>(url, key, {
    auth: { storage: undefined, persistSession: false, autoRefreshToken: false },
    global: {
      fetch: (input, init) => {
        const headers = new Headers(init?.headers);
        if (key.startsWith("sb_") && headers.get("Authorization") === `Bearer ${key}`) headers.delete("Authorization");
        headers.set("apikey", key);
        return fetch(input, { ...init, headers });
      },
    },
  });
}

export const getPublicProfile = createServerFn({ method: "GET" })
  .inputValidator((d: { username: string }) => ({ username: String(d.username).toLowerCase().slice(0, 20) }))
  .handler(async ({ data }): Promise<PublicProfile | null> => {
    const sb = publicClient();
    const { data: profile, error } = await sb
      .from("profiles")
      .select("*, links(id, platform, url, position)")
      .eq("username", data.username)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!profile) return null;
    const links = [...(profile.links ?? [])].sort((a, b) => a.position - b.position);
    return { ...profile, links } as PublicProfile;
  });

export const getSiteStats = createServerFn({ method: "GET" }).handler(async () => {
  const { data, error } = await publicClient().rpc("site_stats");
  if (error) throw new Error(error.message);
  const row = Array.isArray(data) ? data[0] : data;
  return { profiles: Number(row?.profiles ?? 0), views: Number(row?.views ?? 0), links: Number(row?.links ?? 0) };
});
