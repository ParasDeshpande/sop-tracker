# Sumedha Infra - SOP Management Platform

A full-stack SOP (Standard Operating Procedures) management platform for Sumedha Infra Developers Pvt Ltd (150+ employees). Includes a web dashboard, REST API backend, and native mobile apps (iOS & Android).

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                         CLIENTS                                     │
├──────────────┬──────────────────┬───────────────────────────────────┤
│  Web App     │  iOS App         │  Android App                      │
│  (Next.js)   │  (React Native)  │  (React Native)                   │
│  Browser     │  Expo / App Store│  Expo / Play Store                │
└──────┬───────┴────────┬─────────┴──────────┬────────────────────────┘
       │                │                    │
       └────────────────┼────────────────────┘
                        │ HTTPS (JSON)
                        ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    BACKEND (Next.js API Routes)                     │
│                    Hosted on Hostinger VPS                          │
├─────────────────────────────────────────────────────────────────────┤
│  Auth (NextAuth.js)  │  Submissions API  │  Approval System         │
│  Templates API       │  Projects API     │  Notifications           │
│  Reports / Export    │  File Uploads     │  Email (SMTP)            │
└──────────────────────┴──────────┬────────┴──────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    DATABASE (Postgresql on Hostinger)               │
│                    Postgresql for local development                 │
├─────────────────────────────────────────────────────────────────────┤
│  Users  │  Departments  │  Projects  │  Templates  │  Submissions   │
│  Drafts │  Notifications│  ProjectSOPs (assignments)                │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Project Structure

```
/
├── sop-platform/          ← Web App + Backend API (Next.js 14)
│   ├── prisma/
│   │   ├── schema.prisma  ← Database schema
│   │   └── seed.ts        ← Demo data seeder
│   ├── src/
│   │   ├── app/           ← Pages (App Router)
│   │   │   ├── api/       ← REST API routes
│   │   │   ├── dashboard/ ← Protected dashboard pages
│   │   │   ├── login/     ← Auth pages
│   │   │   └── signup/
│   │   ├── components/    ← Reusable UI components
│   │   ├── lib/           ← Utilities (auth, prisma, email, tokens)
│   │   └── types/         ← TypeScript type extensions
│   ├── public/uploads/    ← Uploaded files (gitignored)
│   ├── .env               ← Environment variables
│   └── package.json
│
├── sop-mobile/            ← Mobile App (React Native / Expo)
│   ├── app/               ← Screens (Expo Router - file based)
│   │   ├── (tabs)/        ← Tab navigation screens
│   │   ├── fill/[id].tsx  ← Fill SOP form
│   │   ├── login.tsx      ← Login screen
│   │   └── _layout.tsx    ← Root layout
│   ├── src/
│   │   ├── api.ts         ← API client
│   │   ├── config.ts      ← Backend URL config
│   │   ├── context/       ← Auth state management
│   │   ├── theme.ts       ← Design system (colors, spacing)
│   │   └── types.ts       ← Shared TypeScript types
│   ├── assets/            ← App icons & splash screen
│   ├── app.json           ← Expo configuration
│   └── package.json
│
└── README.md              ← This file
```

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Web Frontend | Next.js 14, React, Tailwind CSS |
| Mobile Frontend | React Native, Expo SDK 51, Expo Router |
| Backend API | Next.js API Routes (same project as web) |
| Database | SQLite (dev) / MySQL (production - Hostinger) |
| ORM | Prisma 5 |
| Auth | NextAuth.js (credentials + Google OAuth ready) |
| File Storage | Local disk (VPS) |
| Email | Console logs (dev) / SMTP ready for production |
| Hosting | Hostinger VPS (Node.js + Nginx + PM2) |

---

## Features

### Roles & Access
- Super Admin: Full access — users, departments, all submissions, all reports
- Admin: Department-level — manage templates, view submissions, assign SOPs
- User: Fill SOPs, view own submissions, complete assigned tasks

### Core Features
- Google Forms-style template builder (11 field types)
- SOP submission with file/image uploads
- Save-as-draft
- Approval workflow (email-based, no login needed for approver)
- Project-level SOP assignments (admin assigns SOPs to users per project)
- Daily tracker dashboard (Excel-style grid: tasks × days)
- PDF download of completed submissions (with embedded images)
- Excel export with date range + department filter
- In-app notifications with badge count (30s polling)
- Email notifications on submission / assignment / approval
- Search + filter on submissions (by title, status, user)
- User deactivation / removal
- Department create / rename / archive

### Mobile-Specific
- 5-tab navigation: SOPs, My Tasks, History, Alerts, Profile
- Pull-to-refresh on all screens
- Native image picker for uploads
- Color-coded status badges
- Offline-friendly auth (token persisted in AsyncStorage)

---

## Quick Start — Web Platform

### Prerequisites
- Node.js 18+
- npm

### Commands

```bash
cd sop-platform
npm install
npx prisma generate
npx prisma db push
npm run db:seed
npm run dev
```

Open http://localhost:3000

### Demo Accounts (password: `admin123`)

| Role | Email |
|------|-------|
| Super Admin | superadmin@sumedhainfra.com |
| Admin (HR) | hr.admin@sumedhainfra.com |
| Admin (Execution) | exec.admin@sumedhainfra.com |
| User | ankit@sumedhainfra.com |
| User | meera@sumedhainfra.com |
| User | rahul@sumedhainfra.com |

---

## Quick Start — Mobile App

### Prerequisites
- Node.js 18+
- Expo CLI: `npm install -g expo-cli`
- Expo Go app installed on your phone (iOS App Store / Google Play)

### Commands

```bash
cd sop-mobile
npm install
```

Edit `src/config.ts` — set `API_BASE_URL` to your computer's local IP:
```ts
export const API_BASE_URL = 'http://192.168.x.x:3000'
```

Then:
```bash
npx expo start
```

Scan the QR code with Expo Go on your phone.

### Build for App Stores

```bash
# Install EAS CLI
npm install -g eas-cli

# Login to Expo
eas login

# Build iOS
eas build --platform ios

# Build Android
eas build --platform android

# Submit to stores
eas submit --platform ios
eas submit --platform android
```

Required accounts:
- Apple Developer ($99/year) — for iOS
- Google Play Developer ($25 one-time) — for Android
- Expo account (free) — for EAS Build

---

## Production Deployment (Hostinger VPS / aws)

### 1. Server Setup

```bash
# SSH into VPS (Ubuntu 22.04)
ssh root@your-vps-ip

# Install Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt install -y nodejs

# Install PM2 + Nginx
npm install -g pm2
apt install -y nginx
```

### 2. postgresql Database

```bash
apt install -y postgresql postgresql-contrib

sudo -u postgres psql
> CREATE DATABASE sop_platform;
> CREATE USER sop_user WITH PASSWORD 'StrongPassword!';
> GRANT ALL PRIVILEGES ON DATABASE sop_platform TO sop_user;
> \q
```

### 3. Deploy App

```bash
git clone <your-repo> /var/www/sop-platform
cd /var/www/sop-platform/sop-platform

# Create .env
cat > .env << EOF
DATABASE_URL="mysql://sop_user:StrongPassword!@localhost:3306/sop_platform"
NEXTAUTH_SECRET="$(openssl rand -base64 32)"
NEXTAUTH_URL="https://yourdomain.com"
EOF

# Switch Prisma to MySQL (edit prisma/schema.prisma: provider = "mysql")
npm install
npx prisma db push
npm run db:seed
npm run build
```

### 4. PM2 + Nginx

```bash
pm2 start npm --name "sop" -- start
pm2 save && pm2 startup

# Nginx config
cat > /etc/nginx/sites-available/sop << 'EOF'
server {
    listen 80;
    server_name yourdomain.com;
    client_max_body_size 50M;
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
EOF

ln -s /etc/nginx/sites-available/sop /etc/nginx/sites-enabled/
nginx -t && systemctl restart nginx
```

### 5. SSL

```bash
apt install certbot python3-certbot-nginx -y
certbot --nginx -d yourdomain.com
```

### 6. Update Mobile Config

In `sop-mobile/src/config.ts`:
```ts
export const API_BASE_URL = 'https://yourdomain.com'
```

Then rebuild mobile apps with `eas build`.

---

## Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| DATABASE_URL | Database connection | `file:./dev.db` or `mysql://...` |
| NEXTAUTH_SECRET | JWT signing secret | `openssl rand -base64 32` |
| NEXTAUTH_URL | Public app URL | `http://localhost:3000` |
| GOOGLE_CLIENT_ID | Google OAuth (optional) | From Google Console |
| GOOGLE_CLIENT_SECRET | Google OAuth (optional) | From Google Console |

---

## API Endpoints

### Auth
- `POST /api/auth/signup` — Register new user
- `POST /api/auth/[...nextauth]` — NextAuth handlers

### Templates
- `GET /api/templates-list` — All active templates (mobile)
- `GET /api/templates/[id]` — Single template with fields
- `POST /api/templates` — Create template (admin)
- `PUT /api/templates/[id]` — Update template (admin)

### Submissions
- `POST /api/submissions` — Submit SOP
- `GET /api/submissions-list` — User's submissions (mobile)
- `GET /api/submissions/[id]/pdf` — Download as PDF

### Approval
- `GET /api/approve?token=...&action=approve` — Public approval link
- `GET /api/approve?token=...&action=reject` — Public rejection link

### Projects & Assignments
- `GET /api/projects` — List projects
- `POST /api/projects` — Create project
- `POST /api/project-sops` — Assign SOP to user in project
- `GET /api/my-tasks` — User's assigned tasks (mobile)

### Other
- `GET /api/departments` — List departments
- `GET /api/notifications` — Unread count
- `GET /api/notifications-list` — All notifications (mobile)
- `GET /api/reports/export` — Excel export
- `GET /api/users-list` — All users (for pickers)

---

## Database Schema (Key Models)

- **User** — email, password, name, role, department, isActive
- **Department** — name, isActive
- **Project** — name, client, department, startDate, endDate
- **SOPTemplate** — title, fields (JSON), approverIds, isDaily
- **SOPSubmission** — responses (JSON), files (JSON), status, approvalToken
- **ProjectSOP** — assignment of template to user within a project (status, dueDate)
- **SOPDraft** — auto-save in progress
- **Notification** — userId, message, link, read

---

## Approval Flow

```
User submits SOP
       │
  Has approverIds?
       │
  YES ──┼── NO
  │          │
  ▼          ▼
PENDING    APPROVED (auto)
APPROVAL   → notify admins
  │
  ▼
Email sent to approver
(approve/reject links with signed token)
  │
  ├── APPROVE → status=APPROVED → notify admins + submitter
  └── REJECT  → status=REJECTED → notify submitter with reason
```

---

## Security

- Passwords: bcrypt (10 rounds)
- Sessions: JWT with HttpOnly cookies
- API: Middleware blocks unauthenticated access
- Files: 10MB limit, filename sanitization
- Approval tokens: HMAC-SHA256 signed, 7-day expiry
- Headers: HSTS, X-Frame-Options DENY, no-sniff, XSS protection
- Role checks: Every API route validates user role

---

## Future Enhancements

- Real SMTP email (nodemailer / Resend / AWS SES)
- Google OAuth sign-in (code ready, commented out)
- Push notifications for mobile (Expo Notifications)
- Real-time updates (WebSocket or SSE)
- Audit log for admin actions
- Multi-language support
- Offline mode for mobile (queue submissions)
