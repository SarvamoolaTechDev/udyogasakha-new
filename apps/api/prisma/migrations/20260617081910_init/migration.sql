-- CreateEnum
CREATE TYPE "RoleType" AS ENUM ('INTERN', 'FRESHER', 'JOB_SEEKER', 'FREELANCER', 'CONSULTANT', 'HIRING_MANAGER', 'RECRUITER', 'TRAINER', 'VENDOR', 'MODERATOR_ROLE', 'RFP_PROVIDER');

-- CreateEnum
CREATE TYPE "MarketField" AS ENUM ('IT_FIELD', 'NON_IT_FIELD', 'SERVICES');

-- CreateEnum
CREATE TYPE "MarketSegment" AS ENUM ('IT_DEVELOPERS', 'IT_DESIGNERS', 'IT_PRODUCT_OWNERS', 'IT_DATA_AI', 'NON_IT_ARTS_MEDIA', 'NON_IT_COMMERCE', 'NON_IT_EDUCATION', 'NON_IT_SPIRITUAL', 'NON_IT_MANAGEMENT', 'NON_IT_HEALTHCARE', 'NON_IT_ENGINEERING', 'SERVICES_CONSULTANCY', 'SERVICES_TRAINING', 'SERVICES_RECRUITMENT', 'SERVICES_VENDOR');

-- CreateEnum
CREATE TYPE "WorkMode" AS ENUM ('WFH', 'ON_SITE', 'HYBRID', 'OFF_SITE');

-- CreateEnum
CREATE TYPE "ListingType" AS ENUM ('JOB_OPENING', 'INTERNSHIP', 'RFP_TENDER', 'TRAINING_PROGRAM', 'CONSULTANCY_NEED', 'VENDOR_REQUIREMENT');

-- CreateEnum
CREATE TYPE "PaymentType" AS ENUM ('PAID', 'UNPAID', 'STIPEND', 'NEGOTIABLE');

-- CreateEnum
CREATE TYPE "CertOpt" AS ENUM ('YES', 'NO');

-- CreateEnum
CREATE TYPE "EmpOption" AS ENUM ('EXISTS', 'NOT_EXISTS');

-- CreateEnum
CREATE TYPE "ProfileStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('PARTICIPANT', 'MODERATOR', 'ADMIN');

-- CreateEnum
CREATE TYPE "DocumentType" AS ENUM ('RESUME', 'CERTIFICATE', 'PORTFOLIO', 'COVER_LETTER', 'PHOTO');

-- CreateEnum
CREATE TYPE "Industry" AS ENUM ('IT_SOFTWARE', 'HEALTHCARE', 'FINANCE_BANKING', 'GOVERNMENT_PSU', 'EDUCATION', 'ENGINEERING', 'MARKETING', 'SERVICES', 'OTHER');

-- CreateEnum
CREATE TYPE "ExperienceLevel" AS ENUM ('ANY', 'FRESHER_0_1', 'EXP_1_3', 'EXP_3_5', 'EXP_5_8', 'EXP_8_PLUS');

-- CreateEnum
CREATE TYPE "Duration" AS ENUM ('SHORT_TERM', 'MEDIUM_TERM', 'LONG_TERM', 'PERMANENT', 'PROJECT_BASED');

-- CreateEnum
CREATE TYPE "UserDocumentType" AS ENUM ('NATIONAL_ID', 'PASSPORT', 'DEGREE_CERTIFICATE', 'PROFESSIONAL_CERTIFICATE', 'TAX_ID', 'OTHER');

-- CreateEnum
CREATE TYPE "VerificationStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "ReportStatus" AS ENUM ('PENDING', 'REVIEWED', 'RESOLVED', 'DISMISSED');

-- CreateEnum
CREATE TYPE "ReportSubjectType" AS ENUM ('USER', 'LISTING', 'PROFILE');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "name" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "roles" "UserRole"[],
    "city" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "refresh_tokens" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "used" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "refresh_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "job_listings" (
    "id" TEXT NOT NULL,
    "organisation_name" TEXT NOT NULL,
    "contact_person" TEXT,
    "contact_email" TEXT,
    "contact_phone" TEXT,
    "listing_type" "ListingType" NOT NULL,
    "target_role_type" "RoleType" NOT NULL,
    "title" TEXT NOT NULL,
    "industry" "Industry" NOT NULL DEFAULT 'OTHER',
    "location" TEXT NOT NULL DEFAULT '',
    "payment" "PaymentType" NOT NULL DEFAULT 'PAID',
    "salary" TEXT,
    "work_mode" "WorkMode" NOT NULL DEFAULT 'ON_SITE',
    "certificate_provided" "CertOpt" NOT NULL DEFAULT 'NO',
    "employment_option" "EmpOption" NOT NULL DEFAULT 'NOT_EXISTS',
    "experience_required" "ExperienceLevel" NOT NULL DEFAULT 'ANY',
    "duration" "Duration" NOT NULL DEFAULT 'PERMANENT',
    "skills" TEXT[],
    "facilities" TEXT[],
    "description" TEXT NOT NULL DEFAULT '',
    "experience_detail" TEXT,
    "responsibilities" TEXT[],
    "requirements" TEXT[],
    "market_field" "MarketField" NOT NULL,
    "status" "ProfileStatus" NOT NULL DEFAULT 'PENDING',
    "icon" TEXT,
    "posted_by_id" TEXT,
    "reviewed_by_id" TEXT,
    "reviewed_at" TIMESTAMP(3),
    "rejection_reason" TEXT,
    "posted_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "job_listings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "candidate_profiles" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "role_type" "RoleType" NOT NULL,
    "full_name" TEXT NOT NULL,
    "date_of_birth" TEXT,
    "gender" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "city" TEXT,
    "skills" TEXT[],
    "summary" TEXT,
    "highest_degree" TEXT,
    "specialization" TEXT,
    "institution" TEXT,
    "year_of_passing" INTEGER,
    "grade" TEXT,
    "role_fields" JSONB NOT NULL DEFAULT '{}',
    "applied_for" TEXT NOT NULL,
    "applied_at_org" TEXT NOT NULL,
    "payment" "PaymentType" NOT NULL DEFAULT 'PAID',
    "certificate" "CertOpt" NOT NULL DEFAULT 'NO',
    "work_mode" "WorkMode" NOT NULL DEFAULT 'ON_SITE',
    "employment_option" "EmpOption" NOT NULL DEFAULT 'NOT_EXISTS',
    "market_segment" "MarketSegment" NOT NULL,
    "preferred_location" TEXT,
    "status" "ProfileStatus" NOT NULL DEFAULT 'PENDING',
    "rejection_reason" TEXT,
    "market_field" "MarketField",
    "submitted_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reviewed_at" TIMESTAMP(3),
    "reviewed_by_id" TEXT,

    CONSTRAINT "candidate_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "experience_entries" (
    "id" TEXT NOT NULL,
    "profile_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "company" TEXT NOT NULL,
    "from_date" TEXT,
    "to_date" TEXT,
    "description" TEXT,
    "display_order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "experience_entries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "candidate_documents" (
    "id" TEXT NOT NULL,
    "profile_id" TEXT NOT NULL,
    "document_type" "DocumentType" NOT NULL,
    "filename" TEXT NOT NULL,
    "mime_type" TEXT NOT NULL,
    "size_bytes" INTEGER NOT NULL,
    "storage_key" TEXT NOT NULL,
    "approved_at" TIMESTAMP(3),
    "uploaded_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "candidate_documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_log" (
    "id" TEXT NOT NULL,
    "entity_type" TEXT NOT NULL,
    "entity_id" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "actor_id" TEXT,
    "actor_email" TEXT,
    "old_state" JSONB,
    "new_state" JSONB,
    "metadata" JSONB,
    "ts" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_log_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "read" BOOLEAN NOT NULL DEFAULT false,
    "link" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_profiles" (
    "user_id" TEXT NOT NULL,
    "full_name" TEXT NOT NULL,
    "bio" TEXT,
    "location" TEXT,
    "participant_type" TEXT,
    "org_name" TEXT,
    "show_contact" BOOLEAN NOT NULL DEFAULT true,
    "avatar_key" TEXT,

    CONSTRAINT "user_profiles_pkey" PRIMARY KEY ("user_id")
);

-- CreateTable
CREATE TABLE "user_documents" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "document_type" "UserDocumentType" NOT NULL,
    "filename" TEXT NOT NULL,
    "mime_type" TEXT NOT NULL,
    "size_bytes" INTEGER NOT NULL,
    "storage_key" TEXT NOT NULL,
    "verified_at" TIMESTAMP(3),
    "verifier_id" TEXT,
    "uploaded_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "trust_records" (
    "user_id" TEXT NOT NULL,
    "current_level" TEXT NOT NULL DEFAULT 'L0',
    "reputation_score" INTEGER NOT NULL DEFAULT 0,
    "completed_engagements" INTEGER NOT NULL DEFAULT 0,
    "last_updated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "trust_records_pkey" PRIMARY KEY ("user_id")
);

-- CreateTable
CREATE TABLE "verification_requests" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "document_ids" TEXT[],
    "status" "VerificationStatus" NOT NULL DEFAULT 'PENDING',
    "review_note" TEXT,
    "reviewed_at" TIMESTAMP(3),
    "reviewer_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "verification_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reports" (
    "id" TEXT NOT NULL,
    "reporter_id" TEXT NOT NULL,
    "subject_type" "ReportSubjectType" NOT NULL,
    "subject_id" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "detail" TEXT,
    "status" "ReportStatus" NOT NULL DEFAULT 'PENDING',
    "resolution" TEXT,
    "resolved_by" TEXT,
    "resolved_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "reports_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "refresh_tokens_token_key" ON "refresh_tokens"("token");

-- CreateIndex
CREATE INDEX "refresh_tokens_user_id_idx" ON "refresh_tokens"("user_id");

-- CreateIndex
CREATE INDEX "job_listings_status_idx" ON "job_listings"("status");

-- CreateIndex
CREATE INDEX "job_listings_target_role_type_idx" ON "job_listings"("target_role_type");

-- CreateIndex
CREATE INDEX "job_listings_market_field_idx" ON "job_listings"("market_field");

-- CreateIndex
CREATE INDEX "candidate_profiles_status_idx" ON "candidate_profiles"("status");

-- CreateIndex
CREATE INDEX "candidate_profiles_role_type_idx" ON "candidate_profiles"("role_type");

-- CreateIndex
CREATE UNIQUE INDEX "candidate_profiles_user_id_role_type_key" ON "candidate_profiles"("user_id", "role_type");

-- CreateIndex
CREATE INDEX "experience_entries_profile_id_idx" ON "experience_entries"("profile_id");

-- CreateIndex
CREATE INDEX "candidate_documents_profile_id_idx" ON "candidate_documents"("profile_id");

-- CreateIndex
CREATE INDEX "audit_log_entity_type_entity_id_idx" ON "audit_log"("entity_type", "entity_id");

-- CreateIndex
CREATE INDEX "audit_log_actor_id_idx" ON "audit_log"("actor_id");

-- CreateIndex
CREATE INDEX "audit_log_ts_idx" ON "audit_log"("ts");

-- CreateIndex
CREATE INDEX "notifications_user_id_read_idx" ON "notifications"("user_id", "read");

-- CreateIndex
CREATE INDEX "notifications_created_at_idx" ON "notifications"("created_at");

-- CreateIndex
CREATE INDEX "user_documents_user_id_idx" ON "user_documents"("user_id");

-- CreateIndex
CREATE INDEX "verification_requests_user_id_idx" ON "verification_requests"("user_id");

-- CreateIndex
CREATE INDEX "verification_requests_status_idx" ON "verification_requests"("status");

-- CreateIndex
CREATE INDEX "reports_status_idx" ON "reports"("status");

-- CreateIndex
CREATE INDEX "reports_subject_type_subject_id_idx" ON "reports"("subject_type", "subject_id");

-- AddForeignKey
ALTER TABLE "refresh_tokens" ADD CONSTRAINT "refresh_tokens_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "job_listings" ADD CONSTRAINT "job_listings_posted_by_id_fkey" FOREIGN KEY ("posted_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "job_listings" ADD CONSTRAINT "job_listings_reviewed_by_id_fkey" FOREIGN KEY ("reviewed_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "candidate_profiles" ADD CONSTRAINT "candidate_profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "candidate_profiles" ADD CONSTRAINT "candidate_profiles_reviewed_by_id_fkey" FOREIGN KEY ("reviewed_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "experience_entries" ADD CONSTRAINT "experience_entries_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "candidate_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "candidate_documents" ADD CONSTRAINT "candidate_documents_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "candidate_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_profiles" ADD CONSTRAINT "user_profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_documents" ADD CONSTRAINT "user_documents_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_documents" ADD CONSTRAINT "user_documents_verifier_id_fkey" FOREIGN KEY ("verifier_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "trust_records" ADD CONSTRAINT "trust_records_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "verification_requests" ADD CONSTRAINT "verification_requests_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "verification_requests" ADD CONSTRAINT "verification_requests_reviewer_id_fkey" FOREIGN KEY ("reviewer_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reports" ADD CONSTRAINT "reports_reporter_id_fkey" FOREIGN KEY ("reporter_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reports" ADD CONSTRAINT "reports_resolved_by_fkey" FOREIGN KEY ("resolved_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
