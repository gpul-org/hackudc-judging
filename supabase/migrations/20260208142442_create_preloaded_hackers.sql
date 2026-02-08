-- CSV import table for expected hackers
CREATE TABLE preloaded_hackers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  school TEXT,
  year_of_study TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  imported_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  used_at TIMESTAMPTZ,  -- Set when hacker signs up
  imported_by UUID REFERENCES auth.users(id)
);

CREATE INDEX idx_preloaded_hackers_email ON preloaded_hackers(email);
CREATE INDEX idx_preloaded_hackers_used_at ON preloaded_hackers(used_at);

-- RLS: Only admins can manage
ALTER TABLE preloaded_hackers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage preloaded hackers"
  ON preloaded_hackers
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );
