-- AlterTable
ALTER TABLE "qr_codes" ADD COLUMN     "cloudinaryPublicId" TEXT,
ADD COLUMN     "format" TEXT NOT NULL DEFAULT 'png',
ADD COLUMN     "metadata" JSONB;
