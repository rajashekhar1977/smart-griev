/*
  # Smart Griev Database Schema

  ## Overview
  Complete database schema for the Smart Griev complaint management system with AI-powered routing.

  ## New Tables
  
  ### 1. profiles
  - `id` (uuid, references auth.users) - User profile ID
  - `name` (text) - User's full name
  - `phone` (text) - Contact number
  - `role` (text) - User role: CITIZEN, OFFICER, ADMIN
  - `department` (text, nullable) - Department for officers
  - `created_at` (timestamptz) - Profile creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ### 2. departments
  - `id` (uuid, primary key) - Department ID
  - `name` (text, unique) - Department name
  - `description` (text) - Department description
  - `email` (text) - Department contact email
  - `phone` (text) - Department contact phone
  - `head_officer_id` (uuid, nullable) - References profiles
  - `created_at` (timestamptz) - Creation timestamp

  ### 3. complaints
  - `id` (text, primary key) - Unique complaint ID (e.g., SMG-2024-001)
  - `user_id` (uuid) - References auth.users
  - `title` (text) - Complaint subject
  - `description` (text) - Detailed description
  - `location` (text) - Location of the issue
  - `status` (text) - Current status
  - `department` (text) - Assigned department
  - `priority` (text) - Priority level
  - `confidence_score` (float) - NLP confidence score
  - `nlp_analysis` (jsonb) - NLP analysis results
  - `date_submitted` (timestamptz) - Submission timestamp
  - `date_updated` (timestamptz) - Last update timestamp
  - `created_at` (timestamptz) - Record creation timestamp

  ### 4. complaint_attachments
  - `id` (uuid, primary key) - Attachment ID
  - `complaint_id` (text) - References complaints
  - `file_name` (text) - Original file name
  - `file_path` (text) - Storage path
  - `file_type` (text) - MIME type
  - `file_size` (integer) - File size in bytes
  - `uploaded_at` (timestamptz) - Upload timestamp

  ### 5. complaint_history
  - `id` (uuid, primary key) - History entry ID
  - `complaint_id` (text) - References complaints
  - `user_id` (uuid) - User who made the change
  - `action` (text) - Action performed
  - `status_from` (text) - Previous status
  - `status_to` (text) - New status
  - `comment` (text) - Optional comment
  - `created_at` (timestamptz) - Action timestamp

  ### 6. notifications
  - `id` (uuid, primary key) - Notification ID
  - `user_id` (uuid) - References auth.users
  - `complaint_id` (text, nullable) - Related complaint
  - `type` (text) - Notification type
  - `message` (text) - Notification message
  - `is_read` (boolean) - Read status
  - `created_at` (timestamptz) - Creation timestamp

  ### 7. nlp_training_data
  - `id` (uuid, primary key) - Training data ID
  - `complaint_text` (text) - Original complaint text
  - `actual_department` (text) - Correct department
  - `predicted_department` (text) - NLP prediction
  - `confidence` (float) - Confidence score
  - `is_correct` (boolean) - Whether prediction was correct
  - `feedback_date` (timestamptz) - Feedback timestamp

  ### 8. feedback_ratings
  - `id` (uuid, primary key) - Feedback ID
  - `complaint_id` (text) - References complaints
  - `rating` (integer) - Rating (1-5)
  - `comment` (text) - Optional comment
  - `created_at` (timestamptz) - Feedback timestamp

  ## Security
  - Enable RLS on all tables
  - Restrictive policies for each user role
  - Authenticated users can only access their own data
  - Officers can access complaints for their department
  - Admins have full access

  ## Important Notes
  1. Uses Supabase Auth for user management
  2. All timestamps use timestamptz for timezone awareness
  3. JSONB used for flexible NLP analysis storage
  4. Complaint IDs are human-readable (SMG-2024-XXX)
*/

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  phone text,
  role text NOT NULL CHECK (role IN ('CITIZEN', 'OFFICER', 'ADMIN')) DEFAULT 'CITIZEN',
  department text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Create departments table
CREATE TABLE IF NOT EXISTS departments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  description text,
  email text,
  phone text,
  head_officer_id uuid REFERENCES profiles(id),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE departments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view departments"
  ON departments FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Only admins can modify departments"
  ON departments FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'ADMIN'
    )
  );

-- Create complaints table
CREATE TABLE IF NOT EXISTS complaints (
  id text PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id),
  title text NOT NULL,
  description text NOT NULL,
  location text NOT NULL,
  status text NOT NULL DEFAULT 'Submitted',
  department text NOT NULL,
  priority text NOT NULL DEFAULT 'Medium' CHECK (priority IN ('Low', 'Medium', 'High')),
  confidence_score float DEFAULT 0.0,
  nlp_analysis jsonb DEFAULT '{}'::jsonb,
  date_submitted timestamptz DEFAULT now(),
  date_updated timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE complaints ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Citizens can view own complaints"
  ON complaints FOR SELECT
  TO authenticated
  USING (
    auth.uid() = user_id
    OR EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('OFFICER', 'ADMIN')
    )
  );

CREATE POLICY "Citizens can insert own complaints"
  ON complaints FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Officers can update complaints in their department"
  ON complaints FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND (
        profiles.role = 'ADMIN'
        OR (profiles.role = 'OFFICER' AND profiles.department = complaints.department)
      )
    )
  );

-- Create complaint_attachments table
CREATE TABLE IF NOT EXISTS complaint_attachments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  complaint_id text NOT NULL REFERENCES complaints(id) ON DELETE CASCADE,
  file_name text NOT NULL,
  file_path text NOT NULL,
  file_type text,
  file_size integer,
  uploaded_at timestamptz DEFAULT now()
);

ALTER TABLE complaint_attachments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view attachments for complaints they can access"
  ON complaint_attachments FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM complaints
      WHERE complaints.id = complaint_attachments.complaint_id
      AND (
        complaints.user_id = auth.uid()
        OR EXISTS (
          SELECT 1 FROM profiles
          WHERE profiles.id = auth.uid()
          AND profiles.role IN ('OFFICER', 'ADMIN')
        )
      )
    )
  );

CREATE POLICY "Users can upload attachments to their complaints"
  ON complaint_attachments FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM complaints
      WHERE complaints.id = complaint_attachments.complaint_id
      AND complaints.user_id = auth.uid()
    )
  );

-- Create complaint_history table
CREATE TABLE IF NOT EXISTS complaint_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  complaint_id text NOT NULL REFERENCES complaints(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id),
  action text NOT NULL,
  status_from text,
  status_to text,
  comment text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE complaint_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view history for complaints they can access"
  ON complaint_history FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM complaints
      WHERE complaints.id = complaint_history.complaint_id
      AND (
        complaints.user_id = auth.uid()
        OR EXISTS (
          SELECT 1 FROM profiles
          WHERE profiles.id = auth.uid()
          AND profiles.role IN ('OFFICER', 'ADMIN')
        )
      )
    )
  );

CREATE POLICY "Officers and admins can add history"
  ON complaint_history FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('OFFICER', 'ADMIN')
    )
  );

-- Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id),
  complaint_id text REFERENCES complaints(id) ON DELETE CASCADE,
  type text NOT NULL,
  message text NOT NULL,
  is_read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own notifications"
  ON notifications FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications"
  ON notifications FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create nlp_training_data table
CREATE TABLE IF NOT EXISTS nlp_training_data (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  complaint_text text NOT NULL,
  actual_department text NOT NULL,
  predicted_department text NOT NULL,
  confidence float NOT NULL,
  is_correct boolean NOT NULL,
  feedback_date timestamptz DEFAULT now()
);

ALTER TABLE nlp_training_data ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Only admins can access training data"
  ON nlp_training_data FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'ADMIN'
    )
  );

-- Create feedback_ratings table
CREATE TABLE IF NOT EXISTS feedback_ratings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  complaint_id text NOT NULL REFERENCES complaints(id) ON DELETE CASCADE,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE feedback_ratings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view feedback for complaints they can access"
  ON feedback_ratings FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM complaints
      WHERE complaints.id = feedback_ratings.complaint_id
      AND (
        complaints.user_id = auth.uid()
        OR EXISTS (
          SELECT 1 FROM profiles
          WHERE profiles.id = auth.uid()
          AND profiles.role IN ('OFFICER', 'ADMIN')
        )
      )
    )
  );

CREATE POLICY "Users can add feedback to their resolved complaints"
  ON feedback_ratings FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM complaints
      WHERE complaints.id = feedback_ratings.complaint_id
      AND complaints.user_id = auth.uid()
      AND complaints.status = 'Resolved'
    )
  );

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_complaints_user_id ON complaints(user_id);
CREATE INDEX IF NOT EXISTS idx_complaints_department ON complaints(department);
CREATE INDEX IF NOT EXISTS idx_complaints_status ON complaints(status);
CREATE INDEX IF NOT EXISTS idx_complaints_date_submitted ON complaints(date_submitted);
CREATE INDEX IF NOT EXISTS idx_complaint_history_complaint_id ON complaint_history(complaint_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);

-- Insert default departments
INSERT INTO departments (name, description, email, phone) VALUES
  ('Public Works & Infrastructure', 'Roads, bridges, potholes, public buildings', 'publicworks@smartgriev.gov', '+1-555-0101'),
  ('Water Supply & Sanitation', 'Water supply, drainage, sewage systems', 'water@smartgriev.gov', '+1-555-0102'),
  ('Electricity & Power', 'Power supply, billing, infrastructure', 'electricity@smartgriev.gov', '+1-555-0103'),
  ('Transportation', 'Public transport, traffic, parking', 'transport@smartgriev.gov', '+1-555-0104'),
  ('Health & Medical Services', 'Hospitals, clinics, sanitation', 'health@smartgriev.gov', '+1-555-0105'),
  ('Education', 'Schools, facilities, teachers', 'education@smartgriev.gov', '+1-555-0106'),
  ('Police & Safety', 'Crime, safety, traffic violations', 'police@smartgriev.gov', '+1-555-0107'),
  ('Revenue & Tax', 'Property tax, bills, certificates', 'revenue@smartgriev.gov', '+1-555-0108'),
  ('Environment & Pollution', 'Air quality, noise, waste management', 'environment@smartgriev.gov', '+1-555-0109'),
  ('Consumer Affairs', 'Consumer complaints, fraud', 'consumer@smartgriev.gov', '+1-555-0110'),
  ('Others', 'General inquiries and other issues', 'general@smartgriev.gov', '+1-555-0111')
ON CONFLICT (name) DO NOTHING;

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_complaints_date_updated
  BEFORE UPDATE ON complaints
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();