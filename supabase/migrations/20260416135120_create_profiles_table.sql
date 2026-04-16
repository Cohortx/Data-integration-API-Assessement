/*
  # Create profiles table for Profile Intelligence Service

  ## Summary
  Creates the core profiles table used to store enriched name profiles
  aggregated from Genderize, Agify, and Nationalize external APIs.

  ## New Tables

  ### profiles
  - `id` (uuid, primary key) - UUID v7 identifier
  - `name` (text, unique) - Normalized lowercase name
  - `gender` (text) - Gender prediction from Genderize
  - `gender_probability` (float) - Confidence score for gender prediction
  - `sample_size` (integer) - Number of samples used by Genderize (renamed from count)
  - `age` (integer) - Predicted age from Agify
  - `age_group` (text) - Derived age classification: child, teenager, adult, senior
  - `country_id` (text) - ISO country code with highest probability from Nationalize
  - `country_probability` (float) - Probability of top country
  - `created_at` (timestamptz) - UTC creation timestamp

  ## Security
  - RLS enabled on profiles table
  - No user-facing policies needed; edge functions use service role which bypasses RLS
  - Data is managed exclusively through server-side edge functions

  ## Notes
  1. Names are stored lowercase for idempotency (case-insensitive deduplication)
  2. UUID v7 IDs are generated at the application layer
  3. The unique constraint on name prevents duplicate profiles
*/

CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY,
  name text UNIQUE NOT NULL,
  gender text NOT NULL,
  gender_probability float NOT NULL,
  sample_size integer NOT NULL,
  age integer NOT NULL,
  age_group text NOT NULL CHECK (age_group IN ('child', 'teenager', 'adult', 'senior')),
  country_id text NOT NULL,
  country_probability float NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS profiles_gender_idx ON profiles(gender);
CREATE INDEX IF NOT EXISTS profiles_country_id_idx ON profiles(country_id);
CREATE INDEX IF NOT EXISTS profiles_age_group_idx ON profiles(age_group);
