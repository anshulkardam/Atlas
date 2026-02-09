/*
  Warnings:

  - Added the required column `updatedAt` to the `Campaign` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Company` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `People` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "EntityType" AS ENUM ('PERSON', 'COMPANY');

-- CreateEnum
CREATE TYPE "SnippetType" AS ENUM ('COMPANY_VALUE_PROP', 'PRODUCT_NAMES', 'PRICING_MODEL', 'KEY_COMPETITORS', 'RECENT_NEWS');

-- CreateEnum
CREATE TYPE "CircuitBreakerState" AS ENUM ('CLOSED', 'OPEN', 'HALF_OPEN');

-- CreateEnum
CREATE TYPE "CircuitBreakerEventType" AS ENUM ('OPENED', 'CLOSED', 'HALF_OPENED', 'SUCCESS', 'FAILURE');

-- AlterEnum
ALTER TYPE "EnrichmentStatus" ADD VALUE 'FAILED';

-- AlterTable
ALTER TABLE "Campaign" ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "Company" ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "People" ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- CreateTable
CREATE TABLE "ContextSnippet" (
    "id" TEXT NOT NULL,
    "entityType" "EntityType" NOT NULL,
    "entityId" TEXT NOT NULL,
    "snippetType" "SnippetType" NOT NULL,
    "payload" JSONB NOT NULL,
    "sourceUrls" JSONB NOT NULL DEFAULT '[]',
    "confidenceScore" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "cacheHitRatio" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ContextSnippet_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SearchLog" (
    "id" TEXT NOT NULL,
    "contextSnippetId" TEXT,
    "iteration" INTEGER NOT NULL,
    "query" TEXT NOT NULL,
    "topResults" JSONB NOT NULL DEFAULT '[]',
    "cacheHit" BOOLEAN NOT NULL DEFAULT false,
    "circuitBreakerState" "CircuitBreakerState" NOT NULL DEFAULT 'CLOSED',
    "responseTimeMs" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SearchLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CircuitBreakerEvent" (
    "id" TEXT NOT NULL,
    "serviceName" TEXT NOT NULL,
    "eventType" "CircuitBreakerEventType" NOT NULL,
    "errorMessage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CircuitBreakerEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ContextSnippet_entityType_entityId_idx" ON "ContextSnippet"("entityType", "entityId");

-- CreateIndex
CREATE INDEX "SearchLog_contextSnippetId_idx" ON "SearchLog"("contextSnippetId");

-- CreateIndex
CREATE INDEX "SearchLog_createdAt_idx" ON "SearchLog"("createdAt");

-- CreateIndex
CREATE INDEX "CircuitBreakerEvent_serviceName_createdAt_idx" ON "CircuitBreakerEvent"("serviceName", "createdAt");

-- AddForeignKey
ALTER TABLE "ContextSnippet" ADD CONSTRAINT "ContextSnippet_person_entityId_fkey" FOREIGN KEY ("entityId") REFERENCES "People"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContextSnippet" ADD CONSTRAINT "ContextSnippet_company_entityId_fkey" FOREIGN KEY ("entityId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SearchLog" ADD CONSTRAINT "SearchLog_contextSnippetId_fkey" FOREIGN KEY ("contextSnippetId") REFERENCES "ContextSnippet"("id") ON DELETE SET NULL ON UPDATE CASCADE;
