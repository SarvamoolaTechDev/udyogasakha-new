-- AlterTable
ALTER TABLE `users` ADD COLUMN `email_verified` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `email_verify_expiry` DATETIME(3) NULL,
    ADD COLUMN `email_verify_token` VARCHAR(191) NULL;
