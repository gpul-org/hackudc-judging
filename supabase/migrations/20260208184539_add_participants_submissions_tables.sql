-- Participants: unique list of people, deduplicated by email
CREATE TABLE participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  first_name TEXT,
  last_name TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Submissions: unique list of projects, deduplicated by devpost_url
CREATE TABLE submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  devpost_url TEXT NOT NULL UNIQUE,
  title TEXT,
  repo_url TEXT,
  demo_url TEXT,
  video_url TEXT,
  prizes TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Junction table linking participants to submissions
CREATE TABLE submission_participants (
  participant_id UUID NOT NULL REFERENCES participants(id) ON DELETE CASCADE,
  submission_id UUID NOT NULL REFERENCES submissions(id) ON DELETE CASCADE,
  PRIMARY KEY (participant_id, submission_id)
);

-- RLS policies
ALTER TABLE participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE submission_participants ENABLE ROW LEVEL SECURITY;

-- Judges and admins can read all data
CREATE POLICY "Authenticated users can read participants"
  ON participants FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IS NOT NULL
    )
  );

CREATE POLICY "Authenticated users can read submissions"
  ON submissions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IS NOT NULL
    )
  );

CREATE POLICY "Authenticated users can read submission_participants"
  ON submission_participants FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IS NOT NULL
    )
  );

-- Only admins can insert/update/delete
CREATE POLICY "Admins can manage participants"
  ON participants FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can manage submissions"
  ON submissions FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can manage submission_participants"
  ON submission_participants FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );
