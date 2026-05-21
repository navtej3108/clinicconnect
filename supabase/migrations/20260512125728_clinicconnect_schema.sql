/*
  # ClinicConnect Full Schema

  ## Tables
  - profiles: extends auth.users with role (patient/doctor/admin)
  - doctors: doctor profile with clinic info, status (pending/approved/rejected)
  - doctor_availability: timeslot configs per doctor
  - appointments: all appointment records with token/status
  - reviews: patient reviews for doctors
  - notifications: in-app notifications

  ## Security
  - RLS on all tables
  - Patients access own data only
  - Doctors access their clinic appointments
  - Admin has full read access via role check
*/

-- Profiles (extends auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role text NOT NULL DEFAULT 'patient' CHECK (role IN ('patient', 'doctor', 'admin')),
  full_name text NOT NULL DEFAULT '',
  email text,
  phone text,
  avatar_url text,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Admins can view all profiles"
  ON profiles FOR SELECT TO authenticated
  USING (
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
  );

-- Doctors table
CREATE TABLE IF NOT EXISTS doctors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text NOT NULL,
  clinic_name text NOT NULL,
  specialization text NOT NULL,
  email text NOT NULL,
  phone text NOT NULL,
  license_number text NOT NULL,
  license_doc_url text,
  address text DEFAULT '',
  city text DEFAULT '',
  state text DEFAULT '',
  latitude double precision,
  longitude double precision,
  consultation_duration_mins int DEFAULT 15,
  rating numeric(3,2) DEFAULT 0,
  review_count int DEFAULT 0,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  bio text DEFAULT '',
  created_at timestamptz DEFAULT now()
);
ALTER TABLE doctors ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Approved doctors are publicly viewable"
  ON doctors FOR SELECT TO authenticated
  USING (status = 'approved' OR user_id = auth.uid() OR
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
  );

CREATE POLICY "Doctors can insert own record"
  ON doctors FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Doctors can update own record"
  ON doctors FOR UPDATE TO authenticated
  USING (user_id = auth.uid() OR
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
  )
  WITH CHECK (user_id = auth.uid() OR
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
  );

-- Doctor availability
CREATE TABLE IF NOT EXISTS doctor_availability (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  doctor_id uuid NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
  day_of_week int NOT NULL CHECK (day_of_week BETWEEN 0 AND 6), -- 0=Sun
  start_time time NOT NULL,
  end_time time NOT NULL,
  max_slots int NOT NULL DEFAULT 20,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  UNIQUE(doctor_id, day_of_week)
);
ALTER TABLE doctor_availability ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Availability is viewable by authenticated users"
  ON doctor_availability FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Doctors can manage own availability"
  ON doctor_availability FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM doctors d WHERE d.id = doctor_id AND d.user_id = auth.uid())
  );

CREATE POLICY "Doctors can update own availability"
  ON doctor_availability FOR UPDATE TO authenticated
  USING (
    EXISTS (SELECT 1 FROM doctors d WHERE d.id = doctor_id AND d.user_id = auth.uid())
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM doctors d WHERE d.id = doctor_id AND d.user_id = auth.uid())
  );

CREATE POLICY "Doctors can delete own availability"
  ON doctor_availability FOR DELETE TO authenticated
  USING (
    EXISTS (SELECT 1 FROM doctors d WHERE d.id = doctor_id AND d.user_id = auth.uid())
  );

-- Appointments
CREATE TABLE IF NOT EXISTS appointments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  doctor_id uuid NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
  patient_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  patient_name text NOT NULL,
  patient_age int NOT NULL,
  patient_gender text NOT NULL CHECK (patient_gender IN ('male', 'female', 'other')),
  symptoms text NOT NULL DEFAULT '',
  appointment_date date NOT NULL,
  appointment_time time NOT NULL,
  token_number int NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled', 'rejected')),
  estimated_wait_mins int DEFAULT 0,
  is_emergency boolean DEFAULT false,
  notes text DEFAULT '',
  created_at timestamptz DEFAULT now()
);
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Patients can view own appointments"
  ON appointments FOR SELECT TO authenticated
  USING (patient_id = auth.uid() OR
    EXISTS (SELECT 1 FROM doctors d WHERE d.id = doctor_id AND d.user_id = auth.uid()) OR
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
  );

CREATE POLICY "Patients can insert own appointments"
  ON appointments FOR INSERT TO authenticated
  WITH CHECK (patient_id = auth.uid());

CREATE POLICY "Patients and doctors can update appointments"
  ON appointments FOR UPDATE TO authenticated
  USING (
    patient_id = auth.uid() OR
    EXISTS (SELECT 1 FROM doctors d WHERE d.id = doctor_id AND d.user_id = auth.uid()) OR
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
  )
  WITH CHECK (
    patient_id = auth.uid() OR
    EXISTS (SELECT 1 FROM doctors d WHERE d.id = doctor_id AND d.user_id = auth.uid()) OR
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
  );

-- Reviews
CREATE TABLE IF NOT EXISTS reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  doctor_id uuid NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
  patient_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  appointment_id uuid REFERENCES appointments(id) ON DELETE SET NULL,
  rating int NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  UNIQUE(appointment_id, patient_id)
);
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Reviews are viewable by authenticated users"
  ON reviews FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Patients can insert own reviews"
  ON reviews FOR INSERT TO authenticated
  WITH CHECK (patient_id = auth.uid());

CREATE POLICY "Patients can update own reviews"
  ON reviews FOR UPDATE TO authenticated
  USING (patient_id = auth.uid())
  WITH CHECK (patient_id = auth.uid());

-- Notifications
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  message text NOT NULL,
  type text DEFAULT 'info' CHECK (type IN ('info', 'success', 'warning', 'error')),
  is_read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own notifications"
  ON notifications FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can update own notifications"
  ON notifications FOR UPDATE TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "System can insert notifications"
  ON notifications FOR INSERT TO authenticated
  WITH CHECK (true);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_doctors_specialization ON doctors(specialization);
CREATE INDEX IF NOT EXISTS idx_doctors_status ON doctors(status);
CREATE INDEX IF NOT EXISTS idx_appointments_patient ON appointments(patient_id);
CREATE INDEX IF NOT EXISTS idx_appointments_doctor ON appointments(doctor_id);
CREATE INDEX IF NOT EXISTS idx_appointments_date ON appointments(appointment_date);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id, is_read);

-- Seed some demo approved doctors
INSERT INTO doctors (
  id, user_id, full_name, clinic_name, specialization, email, phone,
  license_number, address, city, state, latitude, longitude,
  consultation_duration_mins, rating, review_count, status, bio
) VALUES
  (
    'a1b2c3d4-0001-0000-0000-000000000001',
    NULL,
    'Dr. Sarah Mitchell',
    'Mitchell Family Clinic',
    'General',
    'sarah.mitchell@demo.com',
    '555-0101',
    'ML-2024-001',
    '123 Oak Street',
    'Springfield',
    'IL',
    39.7817,
    -89.6501,
    15,
    4.8,
    124,
    'approved',
    'Board-certified family physician with 12 years of experience in preventive care and chronic disease management.'
  ),
  (
    'a1b2c3d4-0002-0000-0000-000000000002',
    NULL,
    'Dr. James Chen',
    'Chen Dental Studio',
    'Dental',
    'james.chen@demo.com',
    '555-0102',
    'DL-2024-002',
    '456 Elm Avenue',
    'Springfield',
    'IL',
    39.7900,
    -89.6440,
    30,
    4.6,
    89,
    'approved',
    'Comprehensive dental care including cosmetic dentistry, implants, and orthodontics.'
  ),
  (
    'a1b2c3d4-0003-0000-0000-000000000003',
    NULL,
    'Dr. Priya Sharma',
    'Skin & Glow Dermatology',
    'Dermatology',
    'priya.sharma@demo.com',
    '555-0103',
    'DS-2024-003',
    '789 Maple Drive',
    'Springfield',
    'IL',
    39.7750,
    -89.6600,
    20,
    4.9,
    203,
    'approved',
    'Specialist in medical and cosmetic dermatology, treating all skin conditions with latest techniques.'
  ),
  (
    'a1b2c3d4-0004-0000-0000-000000000004',
    NULL,
    'Dr. Robert Williams',
    'ENT Care Center',
    'ENT',
    'robert.williams@demo.com',
    '555-0104',
    'EN-2024-004',
    '321 Pine Road',
    'Springfield',
    'IL',
    39.7860,
    -89.6520,
    25,
    4.7,
    156,
    'approved',
    'Expert in ear, nose, and throat conditions with specialized training in sinus surgery and hearing disorders.'
  ),
  (
    'a1b2c3d4-0005-0000-0000-000000000005',
    NULL,
    'Dr. Emily Torres',
    'Pediatric Wellness Center',
    'Pediatrics',
    'emily.torres@demo.com',
    '555-0105',
    'PD-2024-005',
    '654 Birch Lane',
    'Springfield',
    'IL',
    39.7830,
    -89.6480,
    20,
    4.9,
    312,
    'approved',
    'Dedicated pediatrician providing compassionate care for children from newborns to teenagers.'
  )
ON CONFLICT (id) DO NOTHING;

-- Seed availability for demo doctors (Mon-Fri, 9am-5pm)
INSERT INTO doctor_availability (doctor_id, day_of_week, start_time, end_time, max_slots)
SELECT d.id, dow.day, '09:00'::time, '17:00'::time, 20
FROM (VALUES
  ('a1b2c3d4-0001-0000-0000-000000000001'::uuid),
  ('a1b2c3d4-0002-0000-0000-000000000002'::uuid),
  ('a1b2c3d4-0003-0000-0000-000000000003'::uuid),
  ('a1b2c3d4-0004-0000-0000-000000000004'::uuid),
  ('a1b2c3d4-0005-0000-0000-000000000005'::uuid)
) AS d(id)
CROSS JOIN (VALUES (1),(2),(3),(4),(5)) AS dow(day)
ON CONFLICT (doctor_id, day_of_week) DO NOTHING;
