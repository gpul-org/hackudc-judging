-- Remove telegram and discord username fields
ALTER TABLE profiles
  DROP COLUMN IF EXISTS telegram_username,
  DROP COLUMN IF EXISTS discord_username;
