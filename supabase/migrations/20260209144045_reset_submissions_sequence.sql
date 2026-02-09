-- RPC function to reset the submissions number sequence back to 1
-- Only admins can call this (enforced via RLS on the caller side)
CREATE OR REPLACE FUNCTION reset_submissions_sequence()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  PERFORM setval('submissions_number_seq', 1, false);
END;
$$;
