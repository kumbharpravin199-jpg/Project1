/*
  # Student Feedback Analysis Database Schema

  1. New Tables
    - `feedback`
      - `id` (uuid, primary key, auto-generated)
      - `message` (text, required, max 2000 characters)  
      - `sentiment` (text, enum: 'positive', 'negative', 'neutral')
      - `topic` (text, max 100 characters)
      - `suggestions` (text, max 500 characters)
      - `is_anonymous` (boolean, default true)
      - `student_name` (text, nullable)
      - `created_at` (timestamp with timezone, auto-generated)

    - `alerts`
      - `id` (uuid, primary key, auto-generated)
      - `message_id` (uuid, foreign key to feedback.id)
      - `severity` (text, enum: 'low', 'medium', 'high')
      - `alert_type` (text, e.g., 'harassment', 'discrimination', 'unsafe')
      - `created_at` (timestamp with timezone, auto-generated)

  2. Security
    - Enable RLS on all tables
    - Add policies for public access to feedback submission
    - Add policies for authenticated faculty access to dashboard data
    - Add indexes for performance
*/

-- Create enum types for better data validation
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'sentiment_type') THEN
    CREATE TYPE sentiment_type AS ENUM ('positive', 'negative', 'neutral');
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'severity_type') THEN
    CREATE TYPE severity_type AS ENUM ('low', 'medium', 'high');
  END IF;
END $$;

-- Create feedback table
CREATE TABLE IF NOT EXISTS feedback (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  message text NOT NULL CHECK (char_length(message) <= 2000),
  sentiment sentiment_type NOT NULL DEFAULT 'neutral',
  topic text CHECK (char_length(topic) <= 100),
  suggestions text CHECK (char_length(suggestions) <= 500),
  is_anonymous boolean DEFAULT true,
  student_name text CHECK (char_length(student_name) <= 100),
  created_at timestamptz DEFAULT now()
);

-- Create alerts table
CREATE TABLE IF NOT EXISTS alerts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id uuid NOT NULL REFERENCES feedback(id) ON DELETE CASCADE,
  severity severity_type NOT NULL DEFAULT 'medium',
  alert_type text NOT NULL CHECK (char_length(alert_type) <= 50),
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DO $$
BEGIN
  DROP POLICY IF EXISTS "Anyone can submit feedback" ON feedback;
  DROP POLICY IF EXISTS "Faculty can read all feedback" ON feedback;
  DROP POLICY IF EXISTS "Faculty can read all alerts" ON alerts;
  DROP POLICY IF EXISTS "System can create alerts" ON alerts;
EXCEPTION
  WHEN undefined_object THEN NULL;
END $$;

-- Create policies for feedback table
-- Allow anyone to insert feedback (for student submissions)
CREATE POLICY "Anyone can submit feedback"
  ON feedback
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Allow authenticated users (faculty) to read all feedback
CREATE POLICY "Faculty can read all feedback"
  ON feedback
  FOR SELECT
  TO authenticated
  USING (true);

-- Create policies for alerts table  
-- Allow authenticated users (faculty) to read all alerts
CREATE POLICY "Faculty can read all alerts"
  ON alerts
  FOR SELECT
  TO authenticated
  USING (true);

-- Allow anyone to insert alerts (system-generated during feedback submission)
CREATE POLICY "System can create alerts"
  ON alerts
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_feedback_created_at ON feedback(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_feedback_sentiment ON feedback(sentiment);
CREATE INDEX IF NOT EXISTS idx_feedback_topic ON feedback(topic);
CREATE INDEX IF NOT EXISTS idx_alerts_message_id ON alerts(message_id);
CREATE INDEX IF NOT EXISTS idx_alerts_severity ON alerts(severity);
CREATE INDEX IF NOT EXISTS idx_alerts_created_at ON alerts(created_at DESC);