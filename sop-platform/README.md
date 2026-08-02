# Sumedha Infra - SOP Management Platform

## Quick Start

```bash
npm install
npx prisma generate
npx prisma db push
npm run db:seed
npm run dev
```

Open http://localhost:3000

## Demo Accounts (password: `admin123`)

| Role | Email | Name |
|------|-------|------|
| Super Admin | superadmin@sumedhainfra.com | Rajesh Kumar |
| Admin (HR) | hr.admin@sumedhainfra.com | Priya Sharma |
| Admin (Execution) | exec.admin@sumedhainfra.com | Vikram Singh |
| User | ankit@sumedhainfra.com | Ankit Patel |
| User | meera@sumedhainfra.com | Meera Joshi |
| User | rahul@sumedhainfra.com | Rahul Verma |

## Demo Data Included

- 6 departments
- 5 SOP templates (Onboarding, Safety Inspection, Leave, Tender, Marketing)
- 3 projects (Highway, Bridge, Tower)
- 20 submissions spread across 14 days
- Notifications for admins

## Features

- Google Auth ready (commented out, enable with Google Console credentials)
- 3 roles with department-level admin responsibility
- Template creation with required/optional checklist items and file uploads
- Template editing and preview
- Save-as-draft for in-progress SOPs
- Mandatory field validation before submission
- Projects/Clients per department
- User deactivation and removal
- Department create, rename, archive
- Dashboard with visual charts (7-day trend, department breakdown)
- Reports with date range picker, department filter, and preview table
- Excel export
- Notification badge with 30s polling
- Dummy email notifications (replace with SMTP in production)
