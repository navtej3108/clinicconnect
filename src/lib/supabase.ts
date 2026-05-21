import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type UserRole = 'patient' | 'doctor' | 'admin';

export interface Profile {
  id: string;
  role: UserRole;
  full_name: string;
  email: string | null;
  phone: string | null;
  avatar_url: string | null;
  created_at: string;
}

export interface Doctor {
  id: string;
  user_id: string | null;
  full_name: string;
  clinic_name: string;
  specialization: string;
  email: string;
  phone: string;
  license_number: string;
  license_doc_url: string | null;
  address: string;
  city: string;
  state: string;
  latitude: number | null;
  longitude: number | null;
  consultation_duration_mins: number;
  rating: number;
  review_count: number;
  status: 'pending' | 'approved' | 'rejected';
  bio: string;
  created_at: string;
}

export interface DoctorAvailability {
  id: string;
  doctor_id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  max_slots: number;
  is_active: boolean;
}

export interface Appointment {
  id: string;
  doctor_id: string;
  patient_id: string;
  patient_name: string;
  patient_age: number;
  patient_gender: 'male' | 'female' | 'other';
  symptoms: string;
  appointment_date: string;
  appointment_time: string;
  token_number: number;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'rejected';
  estimated_wait_mins: number;
  is_emergency: boolean;
  notes: string;
  created_at: string;
  doctors?: Doctor;
}

export interface Review {
  id: string;
  doctor_id: string;
  patient_id: string;
  appointment_id: string | null;
  rating: number;
  comment: string;
  created_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  is_read: boolean;
  created_at: string;
}
