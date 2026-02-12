/*
  Warnings:

  - The values [SUCCESS,FAILURE] on the enum `CircuitBreakerEventType` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "CircuitBreakerEventType_new" AS ENUM ('OPENED', 'CLOSED', 'HALF_OPENED');
ALTER TABLE "CircuitBreakerEvent" ALTER COLUMN "eventType" TYPE "CircuitBreakerEventType_new" USING ("eventType"::text::"CircuitBreakerEventType_new");
ALTER TYPE "CircuitBreakerEventType" RENAME TO "CircuitBreakerEventType_old";
ALTER TYPE "CircuitBreakerEventType_new" RENAME TO "CircuitBreakerEventType";
DROP TYPE "public"."CircuitBreakerEventType_old";
COMMIT;
