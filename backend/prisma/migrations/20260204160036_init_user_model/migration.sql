/*
  Warnings:

  - The primary key for the `User` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `accountLocationState` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `accountName` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `accountType` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `avatar` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `deletedAt` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `google_avatar` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `google_family_name` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `google_given_name` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `google_locale` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `google_signin` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `isDeleted` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `isDisabled` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `isRegistered` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `phone` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `tokenOfRegisterConfirmation` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `tokenOfResetPassword` on the `User` table. All the data in the column will be lost.
  - The `id` column on the `User` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'DEVELOPER');

-- AlterTable
ALTER TABLE "User" DROP CONSTRAINT "User_pkey",
DROP COLUMN "accountLocationState",
DROP COLUMN "accountName",
DROP COLUMN "accountType",
DROP COLUMN "avatar",
DROP COLUMN "deletedAt",
DROP COLUMN "google_avatar",
DROP COLUMN "google_family_name",
DROP COLUMN "google_given_name",
DROP COLUMN "google_locale",
DROP COLUMN "google_signin",
DROP COLUMN "isDeleted",
DROP COLUMN "isDisabled",
DROP COLUMN "isRegistered",
DROP COLUMN "name",
DROP COLUMN "phone",
DROP COLUMN "tokenOfRegisterConfirmation",
DROP COLUMN "tokenOfResetPassword",
ADD COLUMN     "role" "Role" NOT NULL DEFAULT 'ADMIN',
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
ALTER COLUMN "email" SET DATA TYPE TEXT,
ALTER COLUMN "password" SET DATA TYPE TEXT,
ALTER COLUMN "createdAt" SET DEFAULT CURRENT_TIMESTAMP,
ALTER COLUMN "createdAt" SET DATA TYPE TIMESTAMP(3),
ALTER COLUMN "updatedAt" SET DATA TYPE TIMESTAMP(3),
ADD CONSTRAINT "User_pkey" PRIMARY KEY ("id");
