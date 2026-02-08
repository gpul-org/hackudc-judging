-- Drop the new tables
DROP TABLE IF EXISTS hacker_profiles CASCADE;
DROP TABLE IF EXISTS preloaded_hackers CASCADE;

-- Drop and recreate the user_role enum without 'hacker'
ALTER TABLE profiles ALTER COLUMN role TYPE TEXT;
DROP TYPE IF EXISTS user_role CASCADE;
CREATE TYPE user_role AS ENUM ('judge', 'admin');
ALTER TABLE profiles ALTER COLUMN role TYPE user_role USING role::user_role;

-- Simplify the signup trigger - everyone starts as pending (role = NULL)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS handle_new_user();

CREATE OR REPLACE FUNCTION handle_new_user() RETURNS TRIGGER AS $$
BEGIN
  -- All users start with pending approval (role = NULL)
  INSERT INTO public.profiles (id, role)
  VALUES (NEW.id, NULL);

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();
