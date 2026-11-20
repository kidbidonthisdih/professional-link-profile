ALTER TABLE public.profiles
  ADD COLUMN status text CHECK (status IS NULL OR char_length(status) <= 60),
  ADD COLUMN location text CHECK (location IS NULL OR char_length(location) <= 40),
  ADD COLUMN card_opacity integer NOT NULL DEFAULT 70 CHECK (card_opacity BETWEEN 0 AND 100),
  ADD COLUMN card_blur boolean NOT NULL DEFAULT true,
  ADD COLUMN enter_splash boolean NOT NULL DEFAULT false;

UPDATE public.profiles SET status='live on twitch, ranked grind', location='Berlin', background_url='/images/bg-vexa.jpg', card_opacity=55, enter_splash=true WHERE username='vexa';
UPDATE public.profiles SET status='routing chapter 7', location='Toronto', background_url='/images/bg-kairo.jpg', card_opacity=65 WHERE username='kairo';

CREATE OR REPLACE FUNCTION public.site_stats()
RETURNS TABLE(profiles bigint, views bigint, links bigint) LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT (SELECT count(*) FROM public.profiles), (SELECT coalesce(sum(views),0) FROM public.profiles), (SELECT count(*) FROM public.links);
$$;
GRANT EXECUTE ON FUNCTION public.site_stats() TO anon, authenticated;