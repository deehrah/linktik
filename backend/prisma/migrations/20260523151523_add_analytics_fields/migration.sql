/*
  Warnings:

  - You are about to drop the column `colorDark` on the `qr_codes` table. All the data in the column will be lost.
  - You are about to drop the column `colorLight` on the `qr_codes` table. All the data in the column will be lost.
  - You are about to drop the column `logoUrl` on the `qr_codes` table. All the data in the column will be lost.
  - You are about to drop the column `pdfUrl` on the `qr_codes` table. All the data in the column will be lost.
  - You are about to drop the column `pngUrl` on the `qr_codes` table. All the data in the column will be lost.
  - You are about to drop the column `size` on the `qr_codes` table. All the data in the column will be lost.
  - You are about to drop the column `svgUrl` on the `qr_codes` table. All the data in the column will be lost.
  - Added the required column `imageUrl` to the `qr_codes` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "analytics_clicks" ADD COLUMN     "browserVersion" TEXT,
ADD COLUMN     "deviceModel" TEXT,
ADD COLUMN     "os" TEXT,
ADD COLUMN     "osVersion" TEXT,
ADD COLUMN     "region" TEXT;

-- AlterTable
ALTER TABLE "analytics_scans" ADD COLUMN     "browser" TEXT,
ADD COLUMN     "browserVersion" TEXT,
ADD COLUMN     "city" TEXT,
ADD COLUMN     "deviceModel" TEXT,
ADD COLUMN     "os" TEXT,
ADD COLUMN     "osVersion" TEXT,
ADD COLUMN     "region" TEXT;

-- AlterTable
ALTER TABLE "qr_codes" DROP COLUMN "colorDark",
DROP COLUMN "colorLight",
DROP COLUMN "logoUrl",
DROP COLUMN "pdfUrl",
DROP COLUMN "pngUrl",
DROP COLUMN "size",
DROP COLUMN "svgUrl",
ADD COLUMN     "bgColor" TEXT NOT NULL DEFAULT '#FFFFFF',
ADD COLUMN     "fgColor" TEXT NOT NULL DEFAULT '#000000',
ADD COLUMN     "imageUrl" TEXT NOT NULL DEFAULT 'data:image/png;base64,placeholder';
