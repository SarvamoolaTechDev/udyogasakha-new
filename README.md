# Sarva Moola Udyoga Sakha

UdyogaSakha is a Foundation-governed Udyoga facilitation ecosystem that connects seekers and providers of opportunities — jobs, service engagement roles, projects, and enterprise initiatives — under a transparent trust framework. It is a unified employment ecosystem for 11 role types across IT, Non-IT and Services sectors.

## Quick Start

```bash
# 1. Start services
docker compose up -d

# 2. API
cd apps/api
cp .env.example .env        # set JWT_SECRET and JWT_REFRESH_SECRET
npm install
npx prisma migrate dev --name init
npm run db:seed
npm run dev                 # → http://localhost:3001
                            # → http://localhost:3001/api/docs (Swagger)

# 3. Web (new terminal)
cd apps/web
cp .env.example .env
npm install
npm run dev                 # → http://localhost:3000
```

## Default Credentials

| Role        | Email                       | Password    |
|-------------|----------------------------|-------------|
| Admin       | admin@udyogasakha.in       | Admin@1234  |
| Moderator   | moderator@udyogasakha.in   | Admin@1234  |
| Demo user   | demo@example.com           | Test@1234   |

## Web Pages

| Route                | Description |
|----------------------|-------------|
| `/`                  | Landing — hero, 11 roles, about, how it works |
| `/jobs`              | Browse listings — filter sidebar, search, pagination |
| `/jobs/[id]`         | Full job detail — requirements, facilities, apply |
| `/post`              | Post a job / RFP — enters moderator queue |
| `/profile`           | Role picker — 11 role type cards with live status |
| `/profile/[role]`    | Full candidate profile form for chosen role |
| `/moderator`         | Moderator panel — review, approve, market mapping |
| `/notifications`     | In-app notifications — mark read, filter |
| `/settings`          | Account settings + change password |
| `/audit`             | Audit log — recent / by entity / by actor |
| `/admin/users`       | Admin user list with search and pagination |
| `/admin/users/[id]`  | Admin user detail with profile statuses |
| `/login`             | Sign in |
| `/register`          | Create account |

## API Endpoints (port 3001)

| Module         | Key Routes |
|----------------|------------|
| `auth`         | register, login, refresh, logout, change-password |
| `users`        | GET/PATCH me, GET /users (admin), GET /users/:id |
| `listings`     | browse, post, edit, get by ID, similar, moderate |
| `profiles`     | upsert per role, experience, documents, moderate |
| `market`       | stats, by-role, all-approved |
| `documents`    | upload, list (with URLs), delete |
| `notifications`| list, unread-count, mark-read, mark-all-read |
| `audit`        | recent, by-entity, by-actor |
| `health`       | liveness, readiness |

## Phase 1 Status

**Backend:** Complete. All modules built, DTOs typed, validation, rate limiting, pagination,
audit log (12 events), notifications (BullMQ + stubs), StorageService abstraction.

**Frontend:** Complete. 14 pages, mobile responsive, form validation, skeleton loading states,
notification bell, auth store, JWT middleware.

**Pending client decision before building:**
- Trust levels L0–L4 vs role types + moderator approval
- Opportunity/Engagement lifecycle vs listing + profile model
- Per-user KYC documents vs per-role portfolio documents
- Deterministic vs moderator-assigned market mapping
- Governance module (EGC, DEP, CoI)
- Separate admin portal vs embedded moderator page

## 11 Role Types

`INTERN` `FRESHER` `JOB_SEEKER` `FREELANCER` `CONSULTANT`
`HIRING_MANAGER` `RECRUITER` `TRAINER` `VENDOR` `MODERATOR_ROLE` `RFP_PROVIDER`

## Market Segments

| Field | Sub-segments |
|---|---|
| **IT Field** | Developers, Designers, Product Owners, Data/AI |
| **Non-IT Field** | Arts/Media, Commerce, Education, Spiritual, Management, Healthcare, Engineering |
| **Services** | Consultancy, Training, Recruitment, Vendor |
