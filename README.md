# Sarvamoola Udyoga Sakha

India's unified employment ecosystem for 11 role types across IT, Non-IT and Services sectors.

---

## Monorepo Structure

```
udyogasakha/
├── apps/
│   ├── api/        NestJS backend              → http://localhost:3001
│   ├── web/        Next.js member portal        → http://localhost:3000
│   ├── admin/      Next.js admin/mod portal     → http://localhost:3002
│   └── mobile/     React Native + Expo app      → iOS & Android
├── packages/
│   └── types/      Shared TypeScript enums
├── docker-compose.yml
└── turbo.json
```

---

## Quick Start

### Prerequisites
- Node.js 20+
- Docker Desktop (for PostgreSQL + Redis)
- For mobile: Expo Go app on your phone, or iOS Simulator / Android Emulator

### 1 — Start services
```bash
docker compose up -d
```

### 2 — Backend API
```bash
cd apps/api
cp .env.example .env        # fill JWT_SECRET and JWT_REFRESH_SECRET with random 32+ char strings
npm install
npx prisma migrate dev --name init
npm run db:seed
npm run dev                 # http://localhost:3001
                            # http://localhost:3001/api/docs  (Swagger UI)
```

### 3 — Member portal
```bash
cd apps/web
cp .env.example .env
npm install
npm run dev                 # http://localhost:3000
```

### 4 — Admin portal
```bash
cd apps/admin
cp .env.example .env
npm install
npm run dev                 # http://localhost:3002
```

### 5 — Mobile app
```bash
cd apps/mobile
npm install
npm run dev                 # Scan QR with Expo Go, or press i (iOS) / a (Android)
```

> **Physical device note:** Edit `apps/mobile/src/lib/api.ts` and replace `localhost`
> with your machine's LAN IP (e.g. `192.168.1.100`) so the phone can reach the API.

---

## Default Credentials

| Role      | Email                     | Password    | Portal       |
|-----------|--------------------------|-------------|--------------|
| Admin     | admin@udyogasakha.in     | Admin@1234  | Admin + Mobile |
| Moderator | moderator@udyogasakha.in | Admin@1234  | Admin + Mobile |
| Demo user | demo@example.com         | Test@1234   | Web + Mobile  |

---

## Member Portal — `apps/web` (port 3000)

Public + authenticated pages for candidates and organisations.

| Route              | Description |
|--------------------|-------------|
| `/`                | Landing — hero, 11 role grid, about, how it works, testimonials |
| `/jobs`            | Browse listings — filter sidebar (5 dimensions), search, pagination |
| `/jobs/[id]`       | Job detail — responsibilities, facilities, apply button |
| `/post`            | Post a job / RFP — enters moderator review queue |
| `/profile`         | Role picker — 11 role cards with live status badges |
| `/profile/[role]`  | Role profile form — personal, education, experience, documents |
| `/notifications`   | In-app notifications — mark read, unread filter |
| `/settings`        | Account info, edit name/city/phone, change password |
| `/login`           | Sign in |
| `/register`        | Create account |

---

## Admin Portal — `apps/admin` (port 3002)

Separate Next.js application. **Access restricted to MODERATOR and ADMIN roles only.**
Moderators use this for the bulk of their review work.

| Route          | Description |
|----------------|-------------|
| `/login`       | Admin sign in — rejects accounts without MODERATOR or ADMIN role |
| `/moderation`  | Review pending profiles and job listings — approve / reject with one tap |
| `/users`       | Paginated user list with search — view roles, profile count, join date |
| `/users/[id]`  | User detail — all profile statuses, recent audit trail |
| `/audit`       | Immutable audit log — recent / filter by entity ID / filter by actor ID |

---

## Mobile App — `apps/mobile` (iOS + Android)

Single React Native + Expo codebase compiled to both platforms.
Uses React Navigation with bottom tabs. Authenticates against the same backend API.

### Member screens (all authenticated users)

| Screen          | Description |
|-----------------|-------------|
| Home            | Role grid, live job count, browse and profile CTAs |
| Jobs            | Infinite scroll listing with filter pills and search |
| Job Detail      | Full listing — skills, responsibilities, apply button |
| Post a Job      | Mobile form with auth-gate prompt for unauthenticated users |
| Profile Hub     | 11 role cards with live status badges from API |
| Role Profile    | Personal form, submission details, experience list (add/delete) |
| Notifications   | Paginated list, tap to mark read, mark all read |
| Settings        | Account info, edit form, change password, sign out |

### Moderator screens (MODERATOR and ADMIN roles only)

Moderators see an additional **Moderation** tab in the bottom bar.
Intended for quick actions on the go — detailed bulk work should use the Admin portal.

| Screen           | Description |
|------------------|-------------|
| Moderation Queue | Pending / Approved / Rejected tabs with paginated profile cards |
| Profile Review   | Full profile detail with Approve and Reject actions |

---

## API Modules — `apps/api` (port 3001)

All endpoints prefixed `/api/v1`. Swagger UI at `/api/docs` in dev/staging.

| Module              | Key Endpoints |
|---------------------|---------------|
| `auth`              | register, login, refresh, logout, change-password |
| `users`             | GET/PATCH me, GET /users (admin), GET /users/:id |
| `listings`          | browse, post, edit, get by ID, similar, moderate (approve/reject) |
| `profiles`          | upsert per role, experience, documents, moderate |
| `market`            | stats, by-role, all-approved |
| `documents`         | upload, list (with URLs), delete — per-role portfolio docs |
| `user-documents`    | upload, list, delete — per-user KYC / identity documents |
| `verification`      | request L1 verification, moderator approve/reject |
| `reports`           | submit abuse report, moderator resolve/dismiss |
| `payments`          | Razorpay: create-order, verify, webhook, payment history |
| `notifications`     | list, unread-count, mark-read, mark-all-read |
| `audit`             | recent, by-entity, by-actor |
| `health`            | liveness (`GET /health`), readiness (`GET /health/ready`) |

---

## Database — 15 Models

| Model                | Purpose |
|----------------------|---------|
| `User`               | Core identity — email, passwordHash, roles[] |
| `RefreshToken`       | JWT refresh tokens with replay detection |
| `PasswordResetToken` | One-time, hash-only, 1-hour expiry — used by the forgot/reset password flow |
| `UserProfile`        | Account-level display info — one per user |
| `UserDocument`       | KYC identity documents per user (shared across all roles) |
| `TrustRecord`        | Trust level stub — L0 on register, L1 on first approval |
| `JobListing`         | Listings posted by organisations / recruiters |
| `CandidateProfile`   | Per-role profiles submitted by candidates (11 types) |
| `ExperienceEntry`    | Experience entries within a role profile |
| `CandidateDocument`  | Per-role portfolio documents (resume, certificate, portfolio) |
| `VerificationRequest`| Formal L1 document verification workflow |
| `Report`             | Abuse / misconduct reports submitted by members |
| `Payment`            | Razorpay payment lifecycle — order, capture, method, refund |
| `AuditLog`           | Immutable append-only record of all state changes |
| `Notification`       | In-app notifications (email via Azure Communication Service, SMS stub) |

---

## Market Mapping

Candidates self-select their market segment during profile submission.
The parent market field is derived automatically — moderators do not assign it.

| Market Field | Sub-segments (candidate selects one) |
|---|---|
| **IT Field**     | Developers · Designers · Product Owners · Data/AI |
| **Non-IT Field** | Arts/Media · Commerce · Education · Spiritual · Management · Healthcare · Engineering |
| **Services**     | Consultancy · Training · Recruitment · Vendor |

---

## 11 Role Types

`INTERN` · `FRESHER` · `JOB_SEEKER` · `FREELANCER` · `CONSULTANT`
`HIRING_MANAGER` · `RECRUITER` · `TRAINER` · `VENDOR` · `MODERATOR_ROLE` · `RFP_PROVIDER`

Each role has its own dedicated profile form with role-specific fields, independent moderation, and an independent status. A user can maintain profiles for multiple roles simultaneously.

---

## Infrastructure

| Component      | Technology | Notes |
|----------------|------------|-------|
| API framework  | NestJS 10  | Modular, TypeScript, Swagger |
| ORM            | Prisma 5   | Type-safe queries, migrations |
| Database       | PostgreSQL 16 | Primary data store |
| Cache / Queue  | Redis 7 + BullMQ | Job queue for async notifications |
| File storage   | Local filesystem (default) or Azure Blob Storage | StorageService abstraction — set STORAGE_PROVIDER=azure, no code change needed |
| Rate limiting  | @nestjs/throttler | Global 60/min, auth 10/min |
| Audit logging  | Append-only DB table | 12 event types, actor + timestamp |
| Error tracking | Sentry (stub) | Set SENTRY_DSN in .env to activate |
| Build pipeline | Turborepo | `turbo run dev/build/lint` across all apps |

---

## Pending Client Decisions

The following items are deferred until client sign-off. None block Phase 1 operation.

| Item | Description |
|------|-------------|
| Trust levels L2–L4 | Full trust engine with community endorsement and domain expert certification |
| Engagement lifecycle | Application → Engagement → Feedback tracking (vs current listing-only model) |
| Governance module | EGC, DEP, CoI declarations (depends on trust levels L3–L4) |
| SMS / OTP | Wire MSG91 / Twilio into NotificationsService.sendSms() stub |
| Social login | Google OAuth2 / LinkedIn OAuth2 via Passport.js |
| Separate admin deploy | Move admin portal to internal network / VPN |
| Meilisearch | Full-text search to replace PostgreSQL ILIKE queries |
| Payment pricing | Razorpay integration is built (see Payments below) — actual prices/triggers for listing features, certification fees etc. are a pending product decision |
