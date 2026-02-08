-- Auto-increment number for submissions (1, 2, 3, ...)
CREATE SEQUENCE submissions_number_seq;

ALTER TABLE submissions
  ADD COLUMN number INTEGER NOT NULL DEFAULT nextval('submissions_number_seq');

ALTER SEQUENCE submissions_number_seq OWNED BY submissions.number;

-- Create unique index on number
CREATE UNIQUE INDEX submissions_number_idx ON submissions (number);
