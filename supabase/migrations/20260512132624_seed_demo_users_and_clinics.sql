/*
  # Seed Demo Users and Clinics

  Creates test accounts for:
  - 1 Admin account
  - 3 Approved Doctor accounts with clinics
  - 2 Pending Doctor accounts (awaiting license verification)
  - 3 Patient accounts
  
  All passwords are hashed and ready to use.
*/

-- NOTE: This migration seeds demo data
-- In production, use Supabase Auth UI or your own signup flow

-- Admin user
INSERT INTO auth.users (
  id, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
  created_at, updated_at, role, aud
) VALUES (
  '00000001-0000-0000-0000-000000000000',
  'admin@clinicconnect.demo',
  crypt('Admin@123', gen_salt('bf')),
  now(), '{}', '{}', now(), now(), 'authenticated', 'authenticated'
) ON CONFLICT DO NOTHING;

INSERT INTO profiles (id, role, full_name, email, phone) VALUES
  ('00000001-0000-0000-0000-000000000000', 'admin', 'Admin User', 'admin@clinicconnect.demo', '+1-555-0001')
ON CONFLICT DO NOTHING;

-- Approved Doctor 1: Dr. Sarah Mitchell
INSERT INTO auth.users (
  id, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
  created_at, updated_at, role, aud
) VALUES (
  '00000002-0000-0000-0000-000000000000',
  'sarah.mitchell@clinicconnect.demo',
  crypt('Doctor@123', gen_salt('bf')),
  now(), '{}', '{}', now(), now(), 'authenticated', 'authenticated'
) ON CONFLICT DO NOTHING;

INSERT INTO profiles (id, role, full_name, email, phone) VALUES
  ('00000002-0000-0000-0000-000000000000', 'doctor', 'Dr. Sarah Mitchell', 'sarah.mitchell@clinicconnect.demo', '555-0101')
ON CONFLICT DO NOTHING;

INSERT INTO doctors (
  id, user_id, full_name, clinic_name, specialization, email, phone, license_number,
  address, city, state, latitude, longitude, consultation_duration_mins,
  rating, review_count, status, bio, license_doc_url
) VALUES (
  'a1b2c3d4-0001-0000-0000-000000000001',
  '00000002-0000-0000-0000-000000000000',
  'Dr. Sarah Mitchell',
  'Mitchell Family Clinic',
  'General',
  'sarah.mitchell@clinicconnect.demo',
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
  'Board-certified family physician with 12 years of experience in preventive care and chronic disease management.',
  'https://example.com/licenses/ML-2024-001.pdf'
) ON CONFLICT DO NOTHING;

-- Approved Doctor 2: Dr. James Chen
INSERT INTO auth.users (
  id, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
  created_at, updated_at, role, aud
) VALUES (
  '00000003-0000-0000-0000-000000000000',
  'james.chen@clinicconnect.demo',
  crypt('Doctor@123', gen_salt('bf')),
  now(), '{}', '{}', now(), now(), 'authenticated', 'authenticated'
) ON CONFLICT DO NOTHING;

INSERT INTO profiles (id, role, full_name, email, phone) VALUES
  ('00000003-0000-0000-0000-000000000000', 'doctor', 'Dr. James Chen', 'james.chen@clinicconnect.demo', '555-0102')
ON CONFLICT DO NOTHING;

INSERT INTO doctors (
  id, user_id, full_name, clinic_name, specialization, email, phone, license_number,
  address, city, state, latitude, longitude, consultation_duration_mins,
  rating, review_count, status, bio, license_doc_url
) VALUES (
  'a1b2c3d4-0002-0000-0000-000000000002',
  '00000003-0000-0000-0000-000000000000',
  'Dr. James Chen',
  'Chen Dental Studio',
  'Dental',
  'james.chen@clinicconnect.demo',
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
  'Comprehensive dental care including cosmetic dentistry, implants, and orthodontics.',
  'https://example.com/licenses/DL-2024-002.pdf'
) ON CONFLICT DO NOTHING;

-- Approved Doctor 3: Dr. Priya Sharma
INSERT INTO auth.users (
  id, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
  created_at, updated_at, role, aud
) VALUES (
  '00000004-0000-0000-0000-000000000000',
  'priya.sharma@clinicconnect.demo',
  crypt('Doctor@123', gen_salt('bf')),
  now(), '{}', '{}', now(), now(), 'authenticated', 'authenticated'
) ON CONFLICT DO NOTHING;

INSERT INTO profiles (id, role, full_name, email, phone) VALUES
  ('00000004-0000-0000-0000-000000000000', 'doctor', 'Dr. Priya Sharma', 'priya.sharma@clinicconnect.demo', '555-0103')
ON CONFLICT DO NOTHING;

INSERT INTO doctors (
  id, user_id, full_name, clinic_name, specialization, email, phone, license_number,
  address, city, state, latitude, longitude, consultation_duration_mins,
  rating, review_count, status, bio, license_doc_url
) VALUES (
  'a1b2c3d4-0003-0000-0000-000000000003',
  '00000004-0000-0000-0000-000000000000',
  'Dr. Priya Sharma',
  'Skin & Glow Dermatology',
  'Dermatology',
  'priya.sharma@clinicconnect.demo',
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
  'Specialist in medical and cosmetic dermatology, treating all skin conditions with latest techniques.',
  'https://example.com/licenses/DS-2024-003.pdf'
) ON CONFLICT DO NOTHING;

-- Pending Doctor 1: Dr. Michael Wong (awaiting license verification)
INSERT INTO auth.users (
  id, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
  created_at, updated_at, role, aud
) VALUES (
  '00000005-0000-0000-0000-000000000000',
  'michael.wong@clinicconnect.demo',
  crypt('Doctor@123', gen_salt('bf')),
  now(), '{}', '{}', now(), now(), 'authenticated', 'authenticated'
) ON CONFLICT DO NOTHING;

INSERT INTO profiles (id, role, full_name, email, phone) VALUES
  ('00000005-0000-0000-0000-000000000000', 'doctor', 'Dr. Michael Wong', 'michael.wong@clinicconnect.demo', '555-0104')
ON CONFLICT DO NOTHING;

INSERT INTO doctors (
  id, user_id, full_name, clinic_name, specialization, email, phone, license_number,
  address, city, state, latitude, longitude, consultation_duration_mins,
  rating, review_count, status, bio, license_doc_url
) VALUES (
  'a1b2c3d4-0004-0000-0000-000000000004',
  '00000005-0000-0000-0000-000000000000',
  'Dr. Michael Wong',
  'Wong Cardiology Clinic',
  'Cardiology',
  'michael.wong@clinicconnect.demo',
  '555-0104',
  'CD-2024-004',
  '321 Pine Road',
  'Springfield',
  'IL',
  39.7860,
  -89.6520,
  25,
  0,
  0,
  'pending',
  'Specialist in cardiovascular health and preventive cardiology.',
  NULL
) ON CONFLICT DO NOTHING;

-- Pending Doctor 2: Dr. Emily Torres (awaiting license verification)
INSERT INTO auth.users (
  id, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
  created_at, updated_at, role, aud
) VALUES (
  '00000006-0000-0000-0000-000000000000',
  'emily.torres@clinicconnect.demo',
  crypt('Doctor@123', gen_salt('bf')),
  now(), '{}', '{}', now(), now(), 'authenticated', 'authenticated'
) ON CONFLICT DO NOTHING;

INSERT INTO profiles (id, role, full_name, email, phone) VALUES
  ('00000006-0000-0000-0000-000000000000', 'doctor', 'Dr. Emily Torres', 'emily.torres@clinicconnect.demo', '555-0105')
ON CONFLICT DO NOTHING;

INSERT INTO doctors (
  id, user_id, full_name, clinic_name, specialization, email, phone, license_number,
  address, city, state, latitude, longitude, consultation_duration_mins,
  rating, review_count, status, bio, license_doc_url
) VALUES (
  'a1b2c3d4-0005-0000-0000-000000000005',
  '00000006-0000-0000-0000-000000000000',
  'Dr. Emily Torres',
  'Pediatric Wellness Center',
  'Pediatrics',
  'emily.torres@clinicconnect.demo',
  '555-0105',
  'PD-2024-005',
  '654 Birch Lane',
  'Springfield',
  'IL',
  39.7830,
  -89.6480,
  20,
  0,
  0,
  'pending',
  'Dedicated pediatrician providing compassionate care for children from newborns to teenagers.',
  NULL
) ON CONFLICT DO NOTHING;

-- Patient 1: John Doe
INSERT INTO auth.users (
  id, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
  created_at, updated_at, role, aud
) VALUES (
  '00000007-0000-0000-0000-000000000000',
  'john.doe@clinicconnect.demo',
  crypt('Patient@123', gen_salt('bf')),
  now(), '{}', '{}', now(), now(), 'authenticated', 'authenticated'
) ON CONFLICT DO NOTHING;

INSERT INTO profiles (id, role, full_name, email, phone) VALUES
  ('00000007-0000-0000-0000-000000000000', 'patient', 'John Doe', 'john.doe@clinicconnect.demo', '555-1001')
ON CONFLICT DO NOTHING;

-- Patient 2: Jane Smith
INSERT INTO auth.users (
  id, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
  created_at, updated_at, role, aud
) VALUES (
  '00000008-0000-0000-0000-000000000000',
  'jane.smith@clinicconnect.demo',
  crypt('Patient@123', gen_salt('bf')),
  now(), '{}', '{}', now(), now(), 'authenticated', 'authenticated'
) ON CONFLICT DO NOTHING;

INSERT INTO profiles (id, role, full_name, email, phone) VALUES
  ('00000008-0000-0000-0000-000000000000', 'patient', 'Jane Smith', 'jane.smith@clinicconnect.demo', '555-1002')
ON CONFLICT DO NOTHING;

-- Patient 3: Robert Johnson
INSERT INTO auth.users (
  id, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
  created_at, updated_at, role, aud
) VALUES (
  '00000009-0000-0000-0000-000000000000',
  'robert.johnson@clinicconnect.demo',
  crypt('Patient@123', gen_salt('bf')),
  now(), '{}', '{}', now(), now(), 'authenticated', 'authenticated'
) ON CONFLICT DO NOTHING;

INSERT INTO profiles (id, role, full_name, email, phone) VALUES
  ('00000009-0000-0000-0000-000000000000', 'patient', 'Robert Johnson', 'robert.johnson@clinicconnect.demo', '555-1003')
ON CONFLICT DO NOTHING;

-- Seed availability for approved doctors
INSERT INTO doctor_availability (doctor_id, day_of_week, start_time, end_time, max_slots, is_active)
SELECT d.id, dow.day, '09:00'::time, '17:00'::time, 20, true
FROM (VALUES
  ('a1b2c3d4-0001-0000-0000-000000000001'::uuid),
  ('a1b2c3d4-0002-0000-0000-000000000002'::uuid),
  ('a1b2c3d4-0003-0000-0000-000000000003'::uuid)
) AS d(id)
CROSS JOIN (VALUES (1),(2),(3),(4),(5)) AS dow(day)
ON CONFLICT (doctor_id, day_of_week) DO NOTHING;
