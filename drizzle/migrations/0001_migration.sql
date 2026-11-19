CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _u text := lower(coalesce(NEW.raw_user_meta_data->>'username', ''));
BEGIN
  IF _u = '' THEN
    _u := 'user_' || substr(replace(NEW.id::text, '-', ''), 1, 10);
  ELSIF NOT public.username_available(_u) THEN
    RAISE EXCEPTION 'Username unavailable';
  END IF;
  INSERT INTO public.profiles (user_id, username, display_name) VALUES (NEW.id, _u, _u);
  RETURN NEW;
END $$;