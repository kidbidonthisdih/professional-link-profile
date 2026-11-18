CREATE TABLE public.profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  username text NOT NULL UNIQUE CHECK (username ~ '^[a-z0-9_.]{3,20}$'),
  display_name text NOT NULL DEFAULT '' CHECK (char_length(display_name) <= 40),
  bio text NOT NULL DEFAULT '' CHECK (char_length(bio) <= 160),
  avatar_url text,
  background_url text,
  background_color text NOT NULL DEFAULT '#0a0a0a' CHECK (background_color ~ '^#[0-9a-fA-F]{6}$'),
  discord_tag text CHECK (discord_tag IS NULL OR char_length(discord_tag) <= 40),
  steam_id text CHECK (steam_id IS NULL OR char_length(steam_id) <= 40),
  show_views boolean NOT NULL DEFAULT true,
  views integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.profiles TO anon;
GRANT SELECT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Profiles are public" ON public.profiles FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Owners update profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- prevent owners from changing protected columns
CREATE OR REPLACE FUNCTION public.protect_profile_columns()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  IF current_user = 'authenticated' THEN
    NEW.username := OLD.username;
    NEW.views := OLD.views;
    NEW.user_id := OLD.user_id;
  END IF;
  NEW.updated_at := now();
  RETURN NEW;
END $$;
CREATE TRIGGER profiles_protect BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.protect_profile_columns();

CREATE TABLE public.links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  platform text NOT NULL DEFAULT 'custom',
  url text NOT NULL CHECK (url ~ '^https?://' AND char_length(url) <= 500),
  position integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX links_profile_idx ON public.links(profile_id, position);
GRANT SELECT ON public.links TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.links TO authenticated;
GRANT ALL ON public.links TO service_role;
ALTER TABLE public.links ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Links are public" ON public.links FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Owners insert links" ON public.links FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = profile_id AND p.user_id = auth.uid()));
CREATE POLICY "Owners update links" ON public.links FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = profile_id AND p.user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = profile_id AND p.user_id = auth.uid()));
CREATE POLICY "Owners delete links" ON public.links FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = profile_id AND p.user_id = auth.uid()));

CREATE OR REPLACE FUNCTION public.username_available(_username text)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT lower(_username) ~ '^[a-z0-9_.]{3,20}$'
    AND lower(_username) NOT IN ('login','signup','dashboard','admin','api','auth','settings','about','help','support','terms','privacy','www','app','root','null','undefined','logout','account')
    AND NOT EXISTS (SELECT 1 FROM public.profiles WHERE username = lower(_username));
$$;
GRANT EXECUTE ON FUNCTION public.username_available(text) TO anon, authenticated;

CREATE OR REPLACE FUNCTION public.record_view(_username text)
RETURNS void LANGUAGE sql SECURITY DEFINER SET search_path = public AS $$
  UPDATE public.profiles SET views = views + 1 WHERE username = lower(_username);
$$;
GRANT EXECUTE ON FUNCTION public.record_view(text) TO anon, authenticated;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _u text := lower(coalesce(NEW.raw_user_meta_data->>'username', ''));
BEGIN
  IF NOT public.username_available(_u) THEN
    RAISE EXCEPTION 'Username unavailable';
  END IF;
  INSERT INTO public.profiles (user_id, username, display_name) VALUES (NEW.id, _u, _u);
  RETURN NEW;
END $$;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

INSERT INTO public.profiles (id, username, display_name, bio, discord_tag, views) VALUES
 ('00000000-0000-0000-0000-000000000001','vexa','vexa','Valorant Immortal 2. Streaming weeknights 8pm CET. Duo queue if you can hold a site.','vexa.gg',18420),
 ('00000000-0000-0000-0000-000000000002','kairo','Kairo','Speedrunning Celeste and Hollow Knight. Current any% PB 27:41. VODs on YouTube.','kairo',6315);
INSERT INTO public.links (profile_id, platform, url, position) VALUES
 ('00000000-0000-0000-0000-000000000001','twitch','https://twitch.tv/vexa',0),
 ('00000000-0000-0000-0000-000000000001','x','https://x.com/vexa',1),
 ('00000000-0000-0000-0000-000000000001','youtube','https://youtube.com/@vexa',2),
 ('00000000-0000-0000-0000-000000000001','tiktok','https://tiktok.com/@vexa',3),
 ('00000000-0000-0000-0000-000000000002','youtube','https://youtube.com/@kairo',0),
 ('00000000-0000-0000-0000-000000000002','twitch','https://twitch.tv/kairo',1),
 ('00000000-0000-0000-0000-000000000002','steam','https://steamcommunity.com/id/kairo',2),
 ('00000000-0000-0000-0000-000000000002','github','https://github.com/kairo',3);