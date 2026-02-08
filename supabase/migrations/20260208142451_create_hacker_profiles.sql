-- Create function to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Extended profile data for hackers
CREATE TABLE hacker_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL UNIQUE REFERENCES profiles(id) ON DELETE CASCADE,
  onboarding_completed BOOLEAN NOT NULL DEFAULT FALSE,
  team_id UUID,  -- Will reference teams table later
  bio TEXT,
  skills TEXT[],
  github_username TEXT,
  linkedin_url TEXT,
  portfolio_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_hacker_profiles_profile_id ON hacker_profiles(profile_id);
CREATE INDEX idx_hacker_profiles_team_id ON hacker_profiles(team_id);

-- RLS: Hackers can view all, update own
ALTER TABLE hacker_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Everyone can view hacker profiles"
  ON hacker_profiles
  FOR SELECT
  USING (true);

CREATE POLICY "Hackers can update own profile"
  ON hacker_profiles
  FOR UPDATE
  USING (profile_id = auth.uid());

-- Auto-update trigger for updated_at
CREATE TRIGGER update_hacker_profiles_updated_at
  BEFORE UPDATE ON hacker_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
