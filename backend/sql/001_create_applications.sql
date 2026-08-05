CREATE TABLE IF NOT EXISTS applications (
  id text PRIMARY KEY,
  company text NOT NULL,
  position text NOT NULL,
  location text,
  status text NOT NULL CHECK (
    status IN ('Saved', 'Applied', 'Interview', 'Offer', 'Rejected')
  ),
  job_url text,
  notes text,
  applied_at date,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
