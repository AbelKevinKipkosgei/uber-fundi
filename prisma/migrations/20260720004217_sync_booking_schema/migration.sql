-- AlterTable
ALTER TABLE "bookings" ADD COLUMN     "client_seen" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "provider_seen" BOOLEAN NOT NULL DEFAULT false;
