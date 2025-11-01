/*
  # Add feedback tracking and messaging features

  1. Updates to feedback table
    - Add `student_id` (uuid, foreign key to auth.users)
    - Add `viewed_at` (timestamp)
    - Add `viewed_by` (uuid, foreign key to auth.users)

  2. New Tables
    - `messages`
      - `id` (uuid, primary key)
      - `feedback_id` (uuid, foreign key to feedback.id)
      - `sender_id` (uuid, foreign key to auth.users)
      - `sender_type` (text, enum: 'student', 'faculty')
      - `message` (text)
      - `created_at` (timestamp)

  3. Security
    - Update RLS policies for new features
    - Students can only see their own feedback and messages
    - Faculty can see all feedback and messages
*/

-- Add new columns to feedback table
ALTER TABLE feedback 
ADD COLUMN IF NOT EXISTS student_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS viewed_at timestamptz,
ADD COLUMN IF NOT EXISTS viewed_by uuid REFERENCES auth.users(id) ON DELETE SET NULL;

-- Create sender_type enum
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'sender_type') THEN
    CREATE TYPE sender_type AS ENUM ('student', 'faculty');
  END IF;
END $$;

-- Create messages table
CREATE TABLE IF NOT EXISTS messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  feedback_id uuid NOT NULL REFERENCES feedback(id) ON DELETE CASCADE,
  sender_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  sender_type sender_type NOT NULL,
  message text NOT NULL CHECK (char_length(message) <= 2000),
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Update feedback policies
-- Drop old policies if they exist
DO $$ 
BEGIN
  DROP POLICY IF EXISTS "Anyone can submit feedback" ON feedback;
  DROP POLICY IF EXISTS "Faculty can read all feedback" ON feedback;
  DROP POLICY IF EXISTS "Students can submit feedback" ON feedback;
  DROP POLICY IF EXISTS "Anonymous feedback can be submitted" ON feedback;
  DROP POLICY IF EXISTS "Students can read own feedback" ON feedback;
  DROP POLICY IF EXISTS "Faculty can update feedback" ON feedback;
EXCEPTION
  WHEN undefined_object THEN NULL;
END $$;

-- Students can insert their own feedback (both named and anonymous)
CREATE POLICY "Students can submit feedback"
  ON feedback
  FOR INSERT
  TO authenticated
  WITH CHECK (student_id = auth.uid());

-- Anonymous feedback can be submitted
CREATE POLICY "Anonymous feedback can be submitted"
  ON feedback
  FOR INSERT
  TO anon
  WITH CHECK (is_anonymous = true AND student_id IS NULL);

-- Students can read their own feedback (both anonymous and non-anonymous)
CREATE POLICY "Students can read own feedback"
  ON feedback
  FOR SELECT
  TO authenticated
  USING (student_id = auth.uid());

-- Faculty can read all feedback (combined policy)
-- Faculty is identified by role='faculty' in user metadata or specific email patterns
CREATE POLICY "Faculty can read all feedback"
  ON feedback
  FOR SELECT
  TO authenticated
  USING (
    (auth.jwt() -> 'user_metadata' ->> 'role' = 'faculty') OR
    (auth.jwt() ->> 'email' LIKE '%faculty%') OR
    (auth.jwt() ->> 'email' LIKE '%admin%')
  );

-- Faculty can update feedback (mark as viewed)
CREATE POLICY "Faculty can update feedback"
  ON feedback
  FOR UPDATE
  TO authenticated
  USING (
    (auth.jwt() -> 'user_metadata' ->> 'role' = 'faculty') OR
    (auth.jwt() ->> 'email' LIKE '%faculty%') OR
    (auth.jwt() ->> 'email' LIKE '%admin%')
  )
  WITH CHECK (
    (auth.jwt() -> 'user_metadata' ->> 'role' = 'faculty') OR
    (auth.jwt() ->> 'email' LIKE '%faculty%') OR
    (auth.jwt() ->> 'email' LIKE '%admin%')
  );

-- Message policies
-- Drop existing message policies if they exist
DO $$ 
BEGIN
  DROP POLICY IF EXISTS "Students can send messages" ON messages;
  DROP POLICY IF EXISTS "Faculty can send messages" ON messages;
  DROP POLICY IF EXISTS "Students can read own messages" ON messages;
  DROP POLICY IF EXISTS "Faculty can read all messages" ON messages;
EXCEPTION
  WHEN undefined_object THEN NULL;
END $$;

-- Students can insert messages for their own feedback (both anonymous and non-anonymous)
CREATE POLICY "Students can send messages"
  ON messages
  FOR INSERT
  TO authenticated
  WITH CHECK (
    sender_id = auth.uid() AND 
    sender_type = 'student' AND
    EXISTS (
      SELECT 1 FROM feedback 
      WHERE id = feedback_id 
      AND student_id = auth.uid()
    )
  );

-- Faculty can insert messages for ANY feedback (including anonymous)
CREATE POLICY "Faculty can send messages"
  ON messages
  FOR INSERT
  TO authenticated
  WITH CHECK (
    sender_id = auth.uid() AND 
    sender_type = 'faculty' AND
    (
      (auth.jwt() -> 'user_metadata' ->> 'role' = 'faculty') OR
      (auth.jwt() ->> 'email' LIKE '%faculty%') OR
      (auth.jwt() ->> 'email' LIKE '%admin%')
    )
  );

-- Students can read messages for their own feedback (both anonymous and non-anonymous)
CREATE POLICY "Students can read own messages"
  ON messages
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM feedback 
      WHERE id = feedback_id 
      AND student_id = auth.uid()
    )
  );

-- Faculty can read all messages (including for anonymous feedback)
CREATE POLICY "Faculty can read all messages"
  ON messages
  FOR SELECT
  TO authenticated
  USING (
    (auth.jwt() -> 'user_metadata' ->> 'role' = 'faculty') OR
    (auth.jwt() ->> 'email' LIKE '%faculty%') OR
    (auth.jwt() ->> 'email' LIKE '%admin%')
  );

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_feedback_student_id ON feedback(student_id);
CREATE INDEX IF NOT EXISTS idx_feedback_viewed_at ON feedback(viewed_at);
CREATE INDEX IF NOT EXISTS idx_messages_feedback_id ON messages(feedback_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at DESC);

-- Enable realtime for messages (only if not already added)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' 
    AND schemaname = 'public' 
    AND tablename = 'messages'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE messages;
  END IF;
END $$;
