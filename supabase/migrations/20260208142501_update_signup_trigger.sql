DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS handle_new_user();

CREATE OR REPLACE FUNCTION handle_new_user() RETURNS TRIGGER AS $$
DECLARE
  preloaded_data RECORD;
BEGIN
  -- Check if user is a preloaded hacker
  SELECT
    first_name,
    last_name,
    school,
    year_of_study,
    id as preload_id
  INTO preloaded_data
  FROM preloaded_hackers
  WHERE email = NEW.email
  AND used_at IS NULL
  LIMIT 1;

  IF FOUND THEN
    -- Preloaded hacker: create profile with hacker role
    INSERT INTO public.profiles (id, first_name, last_name, role)
    VALUES (NEW.id, preloaded_data.first_name, preloaded_data.last_name, 'hacker');

    -- Create hacker_profile entry
    INSERT INTO public.hacker_profiles (profile_id)
    VALUES (NEW.id);

    -- Mark preloaded entry as used
    UPDATE preloaded_hackers
    SET used_at = NOW()
    WHERE id = preloaded_data.preload_id;
  ELSE
    -- Unknown user: pending approval (role = NULL)
    INSERT INTO public.profiles (id, role)
    VALUES (NEW.id, NULL);
    -- No hacker_profile created - they might become judge/admin
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();
