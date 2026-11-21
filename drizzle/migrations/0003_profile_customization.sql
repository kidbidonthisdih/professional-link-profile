ALTER TABLE public.profiles ADD COLUMN customization jsonb NOT NULL DEFAULT '{}'::jsonb;
CREATE FUNCTION public.valid_profile_customization(c jsonb) RETURNS boolean LANGUAGE sql IMMUTABLE SET search_path = public AS $$
SELECT jsonb_typeof(c) = 'object' AND octet_length(c::text) <= 4000
AND (NOT c ? 'font' OR c->>'font' IN ('geist','mono','serif'))
AND (NOT c ? 'accent' OR c->>'accent' IN ('neutral','violet','mint','rose','ice'))
AND (NOT c ? 'alignment' OR c->>'alignment' IN ('center','left'))
AND (NOT c ? 'avatarShape' OR c->>'avatarShape' IN ('circle','square'))
AND (NOT c ? 'avatarSize' OR (jsonb_typeof(c->'avatarSize') = 'number' AND (c->>'avatarSize')::numeric BETWEEN 64 AND 120))
AND (NOT c ? 'radius' OR (jsonb_typeof(c->'radius') = 'number' AND (c->>'radius')::numeric BETWEEN 0 AND 32))
AND (NOT c ? 'border' OR jsonb_typeof(c->'border') = 'boolean')
AND (NOT c ? 'linkStyle' OR c->>'linkStyle' IN ('icons','rows'))
AND (NOT c ? 'effect' OR c->>'effect' IN ('none','rain','snow'))
AND (NOT c ? 'backgroundDim' OR (jsonb_typeof(c->'backgroundDim') = 'number' AND (c->>'backgroundDim')::numeric BETWEEN 0 AND 85))
AND (NOT c ? 'backgroundBlur' OR (jsonb_typeof(c->'backgroundBlur') = 'number' AND (c->>'backgroundBlur')::numeric BETWEEN 0 AND 16))
AND (NOT c ? 'splashText' OR (jsonb_typeof(c->'splashText') = 'string' AND length(c->>'splashText') <= 60))
AND (NOT c ? 'musicTitle' OR (jsonb_typeof(c->'musicTitle') = 'string' AND length(c->>'musicTitle') <= 80))
AND (NOT c ? 'musicUrl' OR (jsonb_typeof(c->'musicUrl') = 'string' AND length(c->>'musicUrl') <= 2000 AND (c->>'musicUrl' = '' OR c->>'musicUrl' ~ '^https?://')))
AND (NOT c ? 'musicVolume' OR (jsonb_typeof(c->'musicVolume') = 'number' AND (c->>'musicVolume')::numeric BETWEEN 0 AND 100));
$$;
ALTER TABLE public.profiles ADD CONSTRAINT profiles_customization_valid CHECK (public.valid_profile_customization(customization));