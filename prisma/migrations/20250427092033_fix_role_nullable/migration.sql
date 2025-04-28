-- AlterTable
ALTER TABLE "Appointment" ADD COLUMN     "isPaid" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "role" DROP NOT NULL;
