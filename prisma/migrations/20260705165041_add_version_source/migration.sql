-- CreateEnum
CREATE TYPE "VersionSource" AS ENUM ('ORIGINAL', 'AI_OPTIMIZED', 'MANUAL_EDIT', 'RESTORED');

-- AlterTable: add new columns
ALTER TABLE "ResumeVersion" ADD COLUMN "source" "VersionSource" NOT NULL DEFAULT 'ORIGINAL';
ALTER TABLE "ResumeVersion" ADD COLUMN "customLabel" TEXT;

-- Backfill from existing data instead of dropping it
UPDATE "ResumeVersion" SET "source" = CASE WHEN "isOriginal" THEN 'ORIGINAL' ELSE 'AI_OPTIMIZED' END::"VersionSource";
UPDATE "ResumeVersion" SET "customLabel" = "label";

-- AlterTable: drop the old free-text label column
ALTER TABLE "ResumeVersion" DROP COLUMN "label";
