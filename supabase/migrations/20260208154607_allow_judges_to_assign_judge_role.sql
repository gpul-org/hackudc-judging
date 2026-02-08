-- Add policy to allow judges to assign judge role to pending users
CREATE POLICY "Judges can assign judge role"
  ON profiles
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'judge'
    )
  )
  WITH CHECK (role = 'judge');
