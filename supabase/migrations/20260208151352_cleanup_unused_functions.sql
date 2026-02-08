-- Drop unused function that was created for the dropped hacker_profiles table
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;
