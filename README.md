# ClinicConnect

ClinicConnect is a college web development project for managing clinic appointments and connecting patients with doctors through a web-based interface.

The project was created as a college project with the assistance of **Bolt.new (AI-powered development tool)**. I used Bolt.new to help generate the initial website structure, UI, and application code, and used the resulting project as a practical way to learn and build a working healthcare appointment platform.

> **Project note:** This is a student/college project and should not be considered a production healthcare system.

## Project Overview

The goal of ClinicConnect is to provide a simple online platform where patients can discover clinics/doctors and manage appointments, while doctors and administrators have separate areas for managing their activities.

The current repository is implemented as a React + TypeScript application with Supabase used for authentication and database functionality.

## Main Features

### Patient

- Patient registration and login
- Patient dashboard
- Browse available clinics/doctors
- View doctor/clinic details
- Book appointments
- View personal appointments
- Manage appointment-related information

### Doctor

- Doctor registration
- Doctor dashboard
- Manage doctor profile
- Manage availability
- View and manage appointments

### Admin

- Separate admin login
- Admin dashboard/overview
- Manage doctors
- Manage appointments
- Review platform activity

### Authentication & Access Control

The application includes role-based access for:

- Patient
- Doctor
- Admin

The application uses an authentication context and role-based page protection to direct users to the appropriate dashboard and restrict unauthorized pages.

## Technology Stack

### Frontend

- React 18
- TypeScript
- Vite
- Tailwind CSS
- Lucide React

### Backend / Database Services

- Supabase
- Supabase Authentication
- PostgreSQL database through Supabase
- Row Level Security (RLS)

The repository includes Supabase migration files defining tables, relationships, and access policies. citeturn4view0

### Development

- Node.js
- npm
- ESLint
- Git
- GitHub
- Bolt.new for AI-assisted development

The current `package.json` confirms React, TypeScript, Vite, Tailwind CSS, and `@supabase/supabase-js` as part of the project stack. citeturn1view0

## Application Structure

The React application is organized into separate components, contexts, hooks, and page modules. The repository contains dedicated areas for authentication, patient pages, doctor pages, and admin pages. citeturn1view1turn2view0

A simplified structure is:

```text
clinicconnect/
│
├── src/
│   ├── components/
│   ├── contexts/
│   ├── hooks/
│   ├── lib/
│   ├── pages/
│   │   ├── admin/
│   │   ├── auth/
│   │   ├── doctor/
│   │   └── patient/
│   ├── App.tsx
│   ├── index.css
│   └── main.tsx
│
├── supabase/
│   └── migrations/
│
├── package.json
├── package-lock.json
├── vite.config.ts
├── tailwind.config.js
└── tsconfig.json
```

## Database

ClinicConnect uses Supabase for its backend services.

The database schema includes entities such as:

- `profiles`
- `doctors`
- `doctor_availability`
- `appointments`
- `reviews`
- `notifications`

The schema also defines role information for patients, doctors, and administrators, appointment status values, doctor availability, and Row Level Security policies. citeturn4view0

## Appointment Workflow

The intended basic workflow is:

```text
Patient
   │
   ▼
Register / Login
   │
   ▼
Browse Doctors / Clinics
   │
   ▼
View Doctor Details
   │
   ▼
Select Appointment
   │
   ▼
Book Appointment
   │
   ▼
View Appointment Status
```

Doctors can then access their dashboard and appointment-related pages.

## Application Routing

The application includes routes/pages for:

```text
/
├── /login
├── /register
├── /register-doctor
├── /admin/login
│
├── /patient/dashboard
├── /patient/clinics
├── /patient/clinic-detail
├── /patient/appointments
│
├── /doctor/dashboard
├── /doctor/appointments
├── /doctor/profile
│
├── /admin/overview
├── /admin/doctors
└── /admin/appointments
```

These routes and role checks are implemented in `src/App.tsx`. citeturn3view0

## Getting Started

### Prerequisites

Install:

- Node.js
- npm
- Git

You will also need a Supabase project if you want to connect the application to its database and authentication services.

### 1. Clone the Repository

```bash
git clone https://github.com/navtej3108/clinicconnect.git
cd clinicconnect
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Supabase

Create a Supabase project and configure the required environment variables used by the application.

Do not commit private API keys, service-role keys, passwords, or other secrets to GitHub.

The repository contains Supabase migration files under:

```text
supabase/migrations/
```

These can be used as the database-schema reference for the project.

### 4. Run the Development Server

```bash
npm run dev
```

Vite will provide a local development URL in the terminal.

## Available Scripts

The project currently includes:

```bash
npm run dev
```

Starts the Vite development server.

```bash
npm run build
```

Creates a production build.

```bash
npm run lint
```

Runs ESLint.

```bash
npm run preview
```

Previews the production build locally.

```bash
npm run typecheck
```

Runs the TypeScript type checker.

These scripts are defined in the project's `package.json`. citeturn1view0

## AI-Assisted Development

This project was built during college with assistance from **Bolt.new**, an AI-powered development tool.

Bolt.new was used to help create the initial website structure and implementation. The project therefore represents an **AI-assisted development experience**, rather than claiming that every line of code was written manually from scratch.

Working with the generated project provided practical exposure to:

- React application structure
- TypeScript
- Frontend component organization
- Authentication flows
- Database integration
- Role-based application design
- Supabase
- SQL/database schema concepts
- Debugging and modifying an AI-generated codebase

## What I Learned

Through this project, I gained practical exposure to:

- Building a multi-page React application
- Working with TypeScript
- Creating reusable UI components
- Implementing authentication and user roles
- Connecting a frontend application to Supabase
- Designing database tables and relationships
- Working with Row Level Security
- Handling appointment-related workflows
- Using Git and GitHub for project version control
- Understanding how AI development tools can accelerate application prototyping

## Limitations

This was a college project and was developed primarily as a learning and demonstration project.

Some limitations include:

- It is not intended to be used as a production healthcare platform.
- Healthcare data requires stronger security, privacy, compliance, and operational controls for real-world deployment.
- The application depends on Supabase configuration for authentication and database functionality.
- The UI and functionality can be further refined.
- Additional testing and validation would be required before production use.

## Future Improvements

Potential improvements include:

- Add automated email/SMS appointment reminders.
- Add online payment integration.
- Add video consultation functionality.
- Improve appointment availability and conflict handling.
- Add more detailed patient appointment history.
- Add advanced admin analytics.
- Add comprehensive automated tests.
- Improve accessibility and mobile responsiveness.
- Add stronger production security controls.
- Deploy the application using a production hosting platform.

## Project Purpose

ClinicConnect was created as a **college project** to explore how a real-world appointment-booking problem could be addressed through a web application.

The project also gave me experience working with modern web-development technologies and experimenting with AI-assisted software development using Bolt.new.
