-- CreateTable
CREATE TABLE `users` (
    `id` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `phone` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `password_hash` VARCHAR(191) NOT NULL,
    `roles` JSON NOT NULL,
    `city` VARCHAR(191) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `users_email_key`(`email`),
    UNIQUE INDEX `users_phone_key`(`phone`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `refresh_tokens` (
    `id` VARCHAR(191) NOT NULL,
    `user_id` VARCHAR(191) NOT NULL,
    `token` VARCHAR(512) NOT NULL,
    `expires_at` DATETIME(3) NOT NULL,
    `used` BOOLEAN NOT NULL DEFAULT false,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `refresh_tokens_token_key`(`token`),
    INDEX `refresh_tokens_user_id_idx`(`user_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `password_reset_tokens` (
    `id` VARCHAR(191) NOT NULL,
    `user_id` VARCHAR(191) NOT NULL,
    `token_hash` VARCHAR(512) NOT NULL,
    `expires_at` DATETIME(3) NOT NULL,
    `used` BOOLEAN NOT NULL DEFAULT false,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `password_reset_tokens_token_hash_key`(`token_hash`),
    INDEX `password_reset_tokens_user_id_idx`(`user_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `job_listings` (
    `id` VARCHAR(191) NOT NULL,
    `organisation_name` VARCHAR(191) NOT NULL,
    `contact_person` VARCHAR(191) NULL,
    `contact_email` VARCHAR(191) NULL,
    `contact_phone` VARCHAR(191) NULL,
    `listing_type` ENUM('JOB_OPENING', 'INTERNSHIP', 'RFP_TENDER', 'TRAINING_PROGRAM', 'CONSULTANCY_NEED', 'VENDOR_REQUIREMENT') NOT NULL,
    `target_role_type` ENUM('INTERN', 'FRESHER', 'JOB_SEEKER', 'FREELANCER', 'CONSULTANT', 'HIRING_MANAGER', 'RECRUITER', 'TRAINER', 'VENDOR', 'MODERATOR_ROLE', 'RFP_PROVIDER') NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `industry` ENUM('IT_SOFTWARE', 'HEALTHCARE', 'FINANCE_BANKING', 'GOVERNMENT_PSU', 'EDUCATION', 'ENGINEERING', 'MARKETING', 'SERVICES', 'OTHER') NOT NULL DEFAULT 'OTHER',
    `location` VARCHAR(191) NOT NULL DEFAULT '',
    `payment` ENUM('PAID', 'UNPAID', 'STIPEND', 'NEGOTIABLE') NOT NULL DEFAULT 'PAID',
    `salary` VARCHAR(191) NULL,
    `work_mode` ENUM('WFH', 'ON_SITE', 'HYBRID', 'OFF_SITE') NOT NULL DEFAULT 'ON_SITE',
    `certificate_provided` ENUM('YES', 'NO') NOT NULL DEFAULT 'NO',
    `employment_option` ENUM('EXISTS', 'NOT_EXISTS') NOT NULL DEFAULT 'NOT_EXISTS',
    `experience_required` ENUM('ANY', 'FRESHER_0_1', 'EXP_1_3', 'EXP_3_5', 'EXP_5_8', 'EXP_8_PLUS') NOT NULL DEFAULT 'ANY',
    `duration` ENUM('SHORT_TERM', 'MEDIUM_TERM', 'LONG_TERM', 'PERMANENT', 'PROJECT_BASED') NOT NULL DEFAULT 'PERMANENT',
    `skills` JSON NOT NULL,
    `facilities` JSON NOT NULL,
    `responsibilities` JSON NOT NULL,
    `requirements` JSON NOT NULL,
    `description` TEXT NOT NULL,
    `experience_detail` TEXT NULL,
    `market_field` ENUM('IT_FIELD', 'NON_IT_FIELD', 'SERVICES') NOT NULL,
    `status` ENUM('PENDING', 'APPROVED', 'REJECTED') NOT NULL DEFAULT 'PENDING',
    `icon` VARCHAR(191) NULL,
    `posted_by_id` VARCHAR(191) NULL,
    `reviewed_by_id` VARCHAR(191) NULL,
    `reviewed_at` DATETIME(3) NULL,
    `rejection_reason` TEXT NULL,
    `posted_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `featured` BOOLEAN NOT NULL DEFAULT false,
    `featured_until` DATETIME(3) NULL,

    INDEX `job_listings_status_idx`(`status`),
    INDEX `job_listings_target_role_type_idx`(`target_role_type`),
    INDEX `job_listings_market_field_idx`(`market_field`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `candidate_profiles` (
    `id` VARCHAR(191) NOT NULL,
    `user_id` VARCHAR(191) NOT NULL,
    `role_type` ENUM('INTERN', 'FRESHER', 'JOB_SEEKER', 'FREELANCER', 'CONSULTANT', 'HIRING_MANAGER', 'RECRUITER', 'TRAINER', 'VENDOR', 'MODERATOR_ROLE', 'RFP_PROVIDER') NOT NULL,
    `full_name` VARCHAR(191) NOT NULL,
    `date_of_birth` VARCHAR(191) NULL,
    `gender` VARCHAR(191) NULL,
    `phone` VARCHAR(191) NULL,
    `email` VARCHAR(191) NULL,
    `city` VARCHAR(191) NULL,
    `skills` JSON NOT NULL,
    `summary` TEXT NULL,
    `highest_degree` VARCHAR(191) NULL,
    `specialization` VARCHAR(191) NULL,
    `institution` VARCHAR(191) NULL,
    `year_of_passing` INTEGER NULL,
    `grade` VARCHAR(191) NULL,
    `role_fields` JSON NOT NULL,
    `applied_for` VARCHAR(191) NOT NULL,
    `applied_at_org` VARCHAR(191) NOT NULL,
    `payment` ENUM('PAID', 'UNPAID', 'STIPEND', 'NEGOTIABLE') NOT NULL DEFAULT 'PAID',
    `certificate` ENUM('YES', 'NO') NOT NULL DEFAULT 'NO',
    `work_mode` ENUM('WFH', 'ON_SITE', 'HYBRID', 'OFF_SITE') NOT NULL DEFAULT 'ON_SITE',
    `employment_option` ENUM('EXISTS', 'NOT_EXISTS') NOT NULL DEFAULT 'NOT_EXISTS',
    `market_segment` ENUM('IT_DEVELOPERS', 'IT_DESIGNERS', 'IT_PRODUCT_OWNERS', 'IT_DATA_AI', 'NON_IT_ARTS_MEDIA', 'NON_IT_COMMERCE', 'NON_IT_EDUCATION', 'NON_IT_SPIRITUAL', 'NON_IT_MANAGEMENT', 'NON_IT_HEALTHCARE', 'NON_IT_ENGINEERING', 'SERVICES_CONSULTANCY', 'SERVICES_TRAINING', 'SERVICES_RECRUITMENT', 'SERVICES_VENDOR') NOT NULL,
    `preferred_location` VARCHAR(191) NULL,
    `status` ENUM('PENDING', 'APPROVED', 'REJECTED') NOT NULL DEFAULT 'PENDING',
    `rejection_reason` TEXT NULL,
    `market_field` ENUM('IT_FIELD', 'NON_IT_FIELD', 'SERVICES') NULL,
    `submitted_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `reviewed_at` DATETIME(3) NULL,
    `reviewed_by_id` VARCHAR(191) NULL,

    INDEX `candidate_profiles_status_idx`(`status`),
    INDEX `candidate_profiles_role_type_idx`(`role_type`),
    UNIQUE INDEX `candidate_profiles_user_id_role_type_key`(`user_id`, `role_type`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `experience_entries` (
    `id` VARCHAR(191) NOT NULL,
    `profile_id` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `company` VARCHAR(191) NOT NULL,
    `from_date` VARCHAR(191) NULL,
    `to_date` VARCHAR(191) NULL,
    `description` TEXT NULL,
    `display_order` INTEGER NOT NULL DEFAULT 0,

    INDEX `experience_entries_profile_id_idx`(`profile_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `candidate_documents` (
    `id` VARCHAR(191) NOT NULL,
    `profile_id` VARCHAR(191) NOT NULL,
    `document_type` ENUM('RESUME', 'CERTIFICATE', 'PORTFOLIO', 'COVER_LETTER', 'PHOTO') NOT NULL,
    `filename` VARCHAR(191) NOT NULL,
    `mime_type` VARCHAR(191) NOT NULL,
    `size_bytes` INTEGER NOT NULL,
    `storage_key` VARCHAR(191) NOT NULL,
    `approved_at` DATETIME(3) NULL,
    `uploaded_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `candidate_documents_profile_id_idx`(`profile_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `audit_log` (
    `id` VARCHAR(191) NOT NULL,
    `entity_type` VARCHAR(191) NOT NULL,
    `entity_id` VARCHAR(191) NOT NULL,
    `action` VARCHAR(191) NOT NULL,
    `actor_id` VARCHAR(191) NULL,
    `actor_email` VARCHAR(191) NULL,
    `old_state` JSON NULL,
    `new_state` JSON NULL,
    `metadata` JSON NULL,
    `ts` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `audit_log_entity_type_entity_id_idx`(`entity_type`, `entity_id`),
    INDEX `audit_log_actor_id_idx`(`actor_id`),
    INDEX `audit_log_ts_idx`(`ts`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `notifications` (
    `id` VARCHAR(191) NOT NULL,
    `user_id` VARCHAR(191) NOT NULL,
    `subject` VARCHAR(191) NOT NULL,
    `body` TEXT NOT NULL,
    `read` BOOLEAN NOT NULL DEFAULT false,
    `link` VARCHAR(191) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `notifications_user_id_read_idx`(`user_id`, `read`),
    INDEX `notifications_created_at_idx`(`created_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `user_profiles` (
    `user_id` VARCHAR(191) NOT NULL,
    `full_name` VARCHAR(191) NOT NULL,
    `bio` TEXT NULL,
    `location` VARCHAR(191) NULL,
    `participant_type` VARCHAR(191) NULL,
    `org_name` VARCHAR(191) NULL,
    `show_contact` BOOLEAN NOT NULL DEFAULT true,
    `avatar_key` VARCHAR(191) NULL,

    PRIMARY KEY (`user_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `user_documents` (
    `id` VARCHAR(191) NOT NULL,
    `user_id` VARCHAR(191) NOT NULL,
    `document_type` ENUM('NATIONAL_ID', 'PASSPORT', 'DEGREE_CERTIFICATE', 'PROFESSIONAL_CERTIFICATE', 'TAX_ID', 'OTHER') NOT NULL,
    `filename` VARCHAR(191) NOT NULL,
    `mime_type` VARCHAR(191) NOT NULL,
    `size_bytes` INTEGER NOT NULL,
    `storage_key` VARCHAR(191) NOT NULL,
    `verified_at` DATETIME(3) NULL,
    `verifier_id` VARCHAR(191) NULL,
    `uploaded_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `user_documents_user_id_idx`(`user_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `trust_records` (
    `user_id` VARCHAR(191) NOT NULL,
    `current_level` VARCHAR(191) NOT NULL DEFAULT 'L0',
    `reputation_score` INTEGER NOT NULL DEFAULT 0,
    `completed_engagements` INTEGER NOT NULL DEFAULT 0,
    `last_updated` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`user_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `verification_requests` (
    `id` VARCHAR(191) NOT NULL,
    `user_id` VARCHAR(191) NOT NULL,
    `document_ids` JSON NOT NULL,
    `status` ENUM('PENDING', 'APPROVED', 'REJECTED') NOT NULL DEFAULT 'PENDING',
    `review_note` TEXT NULL,
    `reviewed_at` DATETIME(3) NULL,
    `reviewer_id` VARCHAR(191) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `verification_requests_user_id_idx`(`user_id`),
    INDEX `verification_requests_status_idx`(`status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `reports` (
    `id` VARCHAR(191) NOT NULL,
    `reporter_id` VARCHAR(191) NOT NULL,
    `subject_type` ENUM('USER', 'LISTING', 'PROFILE') NOT NULL,
    `subject_id` VARCHAR(191) NOT NULL,
    `reason` TEXT NOT NULL,
    `detail` TEXT NULL,
    `status` ENUM('PENDING', 'REVIEWED', 'RESOLVED', 'DISMISSED') NOT NULL DEFAULT 'PENDING',
    `resolution` TEXT NULL,
    `resolved_by` VARCHAR(191) NULL,
    `resolved_at` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `reports_status_idx`(`status`),
    INDEX `reports_subject_type_subject_id_idx`(`subject_type`, `subject_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `payments` (
    `id` VARCHAR(191) NOT NULL,
    `user_id` VARCHAR(191) NOT NULL,
    `purpose` ENUM('LISTING_FEATURE', 'CERTIFICATION_FEE', 'REGISTRATION_FEE', 'WALLET_TOPUP', 'OTHER') NOT NULL,
    `reference_id` VARCHAR(191) NULL,
    `amount_paise` INTEGER NOT NULL,
    `currency` VARCHAR(191) NOT NULL DEFAULT 'INR',
    `razorpay_order_id` VARCHAR(191) NOT NULL,
    `razorpay_payment_id` VARCHAR(191) NULL,
    `status` ENUM('CREATED', 'AUTHORIZED', 'CAPTURED', 'FAILED', 'REFUNDED') NOT NULL DEFAULT 'CREATED',
    `method` ENUM('CARD', 'UPI', 'NETBANKING', 'WALLET', 'EMI', 'PAYLATER', 'INTERNATIONAL_CARD', 'OTHER') NULL,
    `international_payment` BOOLEAN NOT NULL DEFAULT false,
    `failure_reason` VARCHAR(191) NULL,
    `refunded_paise` INTEGER NULL,
    `metadata` JSON NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `payments_razorpay_order_id_key`(`razorpay_order_id`),
    INDEX `payments_user_id_idx`(`user_id`),
    INDEX `payments_status_idx`(`status`),
    INDEX `payments_purpose_reference_id_idx`(`purpose`, `reference_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `wallets` (
    `id` VARCHAR(191) NOT NULL,
    `user_id` VARCHAR(191) NOT NULL,
    `balance` INTEGER NOT NULL DEFAULT 0,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `wallets_user_id_key`(`user_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `point_transactions` (
    `id` VARCHAR(191) NOT NULL,
    `wallet_id` VARCHAR(191) NOT NULL,
    `amount` INTEGER NOT NULL,
    `type` ENUM('SIGNUP_BONUS', 'JOB_UNLOCK', 'PROFILE_UNLOCK', 'TOPUP', 'ADMIN_ADJUSTMENT') NOT NULL,
    `reference_id` VARCHAR(191) NULL,
    `note` TEXT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `point_transactions_wallet_id_idx`(`wallet_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `listing_unlocks` (
    `id` VARCHAR(191) NOT NULL,
    `user_id` VARCHAR(191) NOT NULL,
    `listing_id` VARCHAR(191) NOT NULL,
    `unlocked_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `listing_unlocks_user_id_idx`(`user_id`),
    UNIQUE INDEX `listing_unlocks_user_id_listing_id_key`(`user_id`, `listing_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `profile_unlocks` (
    `id` VARCHAR(191) NOT NULL,
    `user_id` VARCHAR(191) NOT NULL,
    `profile_id` VARCHAR(191) NOT NULL,
    `unlocked_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `profile_unlocks_user_id_idx`(`user_id`),
    UNIQUE INDEX `profile_unlocks_user_id_profile_id_key`(`user_id`, `profile_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `admin_users` (
    `id` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `password_hash` VARCHAR(191) NOT NULL,
    `role` ENUM('ADMIN', 'MODERATOR') NOT NULL DEFAULT 'MODERATOR',
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `created_by_id` VARCHAR(191) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `admin_users_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `refresh_tokens` ADD CONSTRAINT `refresh_tokens_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `password_reset_tokens` ADD CONSTRAINT `password_reset_tokens_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `job_listings` ADD CONSTRAINT `job_listings_posted_by_id_fkey` FOREIGN KEY (`posted_by_id`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `job_listings` ADD CONSTRAINT `job_listings_reviewed_by_id_fkey` FOREIGN KEY (`reviewed_by_id`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `candidate_profiles` ADD CONSTRAINT `candidate_profiles_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `candidate_profiles` ADD CONSTRAINT `candidate_profiles_reviewed_by_id_fkey` FOREIGN KEY (`reviewed_by_id`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `experience_entries` ADD CONSTRAINT `experience_entries_profile_id_fkey` FOREIGN KEY (`profile_id`) REFERENCES `candidate_profiles`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `candidate_documents` ADD CONSTRAINT `candidate_documents_profile_id_fkey` FOREIGN KEY (`profile_id`) REFERENCES `candidate_profiles`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `notifications` ADD CONSTRAINT `notifications_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `user_profiles` ADD CONSTRAINT `user_profiles_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `user_documents` ADD CONSTRAINT `user_documents_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `user_documents` ADD CONSTRAINT `user_documents_verifier_id_fkey` FOREIGN KEY (`verifier_id`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `trust_records` ADD CONSTRAINT `trust_records_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `verification_requests` ADD CONSTRAINT `verification_requests_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `verification_requests` ADD CONSTRAINT `verification_requests_reviewer_id_fkey` FOREIGN KEY (`reviewer_id`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `reports` ADD CONSTRAINT `reports_reporter_id_fkey` FOREIGN KEY (`reporter_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `reports` ADD CONSTRAINT `reports_resolved_by_fkey` FOREIGN KEY (`resolved_by`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `payments` ADD CONSTRAINT `payments_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `wallets` ADD CONSTRAINT `wallets_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `point_transactions` ADD CONSTRAINT `point_transactions_wallet_id_fkey` FOREIGN KEY (`wallet_id`) REFERENCES `wallets`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `listing_unlocks` ADD CONSTRAINT `listing_unlocks_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `listing_unlocks` ADD CONSTRAINT `listing_unlocks_listing_id_fkey` FOREIGN KEY (`listing_id`) REFERENCES `job_listings`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `profile_unlocks` ADD CONSTRAINT `profile_unlocks_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `profile_unlocks` ADD CONSTRAINT `profile_unlocks_profile_id_fkey` FOREIGN KEY (`profile_id`) REFERENCES `candidate_profiles`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
