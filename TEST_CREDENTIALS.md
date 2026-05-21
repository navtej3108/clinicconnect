# ClinicConnect - Test Credentials & Login Guide

## Overview
All credentials are saved in Supabase Auth and will persist across sessions. Simply sign in once and you'll remain logged in.

---

## Admin Account
**Email:** `admin@clinicconnect.demo`  
**Password:** `Admin@123`

**Access:** Click "Admin Portal" link at bottom of login form  
**Role:** Full platform admin - verify doctors, manage appointments, view analytics

---

## Doctor Accounts (Approved)
These doctors are already approved and can log in immediately:

### Dr. Sarah Mitchell - General Practitioner
**Email:** `sarah.mitchell@clinicconnect.demo`  
**Password:** `Doctor@123`  
**Clinic:** Mitchell Family Clinic  
**Specialization:** General  
**License #:** ML-2024-001  
**Status:** ✅ Approved

### Dr. James Chen - Dentist
**Email:** `james.chen@clinicconnect.demo`  
**Password:** `Doctor@123`  
**Clinic:** Chen Dental Studio  
**Specialization:** Dental  
**License #:** DL-2024-002  
**Status:** ✅ Approved

### Dr. Priya Sharma - Dermatologist
**Email:** `priya.sharma@clinicconnect.demo`  
**Password:** `Doctor@123`  
**Clinic:** Skin & Glow Dermatology  
**Specialization:** Dermatology  
**License #:** DS-2024-003  
**Status:** ✅ Approved

---

## Doctor Accounts (Pending Verification)
These doctors are awaiting license verification by admin:

### Dr. Michael Wong - Cardiologist
**Email:** `michael.wong@clinicconnect.demo`  
**Password:** `Doctor@123`  
**Clinic:** Wong Cardiology Clinic  
**Specialization:** Cardiology  
**License #:** CD-2024-004  
**Status:** ⏳ Pending Review (Admin must approve)

### Dr. Emily Torres - Pediatrician
**Email:** `emily.torres@clinicconnect.demo`  
**Password:** `Doctor@123`  
**Clinic:** Pediatric Wellness Center  
**Specialization:** Pediatrics  
**License #:** PD-2024-005  
**Status:** ⏳ Pending Review (Admin must approve)

---

## Patient Accounts
Regular patients can book appointments:

### Patient 1
**Email:** `john.doe@clinicconnect.demo`  
**Password:** `Patient@123`

### Patient 2
**Email:** `jane.smith@clinicconnect.demo`  
**Password:** `Patient@123`

### Patient 3
**Email:** `robert.johnson@clinicconnect.demo`  
**Password:** `Patient@123`

---

## How to Use

### For Patients
1. Sign in with patient email/password
2. Click "Find Clinics" or "Browse Specializations"
3. Select a doctor and check availability
4. Book appointment by selecting date/time and entering details
5. Get instant token number and wait time

### For Approved Doctors
1. Sign in with doctor email/password
2. View "Today's Schedule" on dashboard
3. Go to "Patient Appointments" to manage bookings
4. Click "Manage Profile" to set working hours and clinic details
5. Confirm/Complete/Reject appointments as needed

### For Pending Doctors
1. Sign in with doctor email/password
2. See message "Account Under Review"
3. Admin will verify your license and approve
4. Once approved, you can start accepting patients

### For Admin
1. Go to sign-in page, click "Admin Portal"
2. Sign in with admin email/password
3. View dashboard with platform stats
4. Go to "Doctors" tab to see pending registrations
5. Click "View License Document" to review
6. Click "Approve" or "Reject" to verify doctor

---

## Key Features

✅ **Login Persistence** - Stay signed in across sessions (saved in Supabase)  
✅ **License Verification** - Doctors upload URLs, admins verify and approve  
✅ **Clinic Management** - Doctors edit profile, set hours, manage availability  
✅ **Smart Scheduling** - Auto-assign slots, prevent double-booking  
✅ **Token System** - Patients get queue token #, estimated wait time  
✅ **Appointment Management** - Cancel, reschedule, complete, reject  
✅ **Role-Based Access** - Separate dashboards for patients, doctors, admins  

---

## Troubleshooting

**Still not logged in after refreshing?**
- Check browser console for errors
- Clear cache and try again
- Ensure Supabase connection is working

**Doctor status is still "Pending"?**
- Admin must approve in the "Doctors" admin panel
- Check that license document URL is valid and accessible

**Can't book appointment?**
- Make sure doctor is "Approved" status
- Check doctor working hours are set (Doctor > Manage Profile)
- Verify availability hasn't been filled

---

## Notes
- All passwords use strong hashing with bcrypt
- Demo data is seeded in Supabase PostgreSQL
- RLS policies ensure users only see their own data
- Token numbers auto-increment per doctor per day
