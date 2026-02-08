-- Add Telegram and Discord username fields for notifications
ALTER TABLE profiles
  ADD COLUMN telegram_username TEXT,
  ADD COLUMN discord_username TEXT;

-- Make role nullable (NULL = pending approval)
ALTER TABLE profiles
  ALTER COLUMN role DROP DEFAULT,
  ALTER COLUMN role DROP NOT NULL;

COMMENT ON COLUMN profiles.role IS 'User role: hacker, judge, or admin. NULL indicates pending approval.';
