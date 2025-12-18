-- CreateEnum
CREATE TYPE "LeadPriority" AS ENUM ('BAIXA', 'MEDIA', 'ALTA', 'URGENTE');

-- CreateEnum
CREATE TYPE "EventoTipo" AS ENUM ('VISITA', 'ACOMPANHAMENTO', 'REUNIAO', 'URGENTE');

-- CreateEnum
CREATE TYPE "TimelineAction" AS ENUM ('CREATED', 'STATUS_CHANGED', 'NOTE_ADDED', 'EVENT_SCHEDULED', 'EVENT_COMPLETED', 'CONTACT_MADE', 'EMAIL_SENT', 'WHATSAPP_SENT', 'KANBAN_MOVED');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "LeadStatus" ADD VALUE 'ACOMPANHAMENTO';
ALTER TYPE "LeadStatus" ADD VALUE 'VISITA_AGENDADA';
ALTER TYPE "LeadStatus" ADD VALUE 'FECHADO';

-- AlterTable
ALTER TABLE "leads" ADD COLUMN     "kanbanColumnId" TEXT,
ADD COLUMN     "priority" "LeadPriority" NOT NULL DEFAULT 'MEDIA';

-- CreateTable
CREATE TABLE "kanban_boards" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "isGlobal" BOOLEAN NOT NULL DEFAULT false,
    "ownerId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "kanban_boards_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "kanban_columns" (
    "id" TEXT NOT NULL,
    "boardId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "color" TEXT,
    "isFinal" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "kanban_columns_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "kanban_permissions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "canEditBoard" BOOLEAN NOT NULL DEFAULT false,
    "canEditColumns" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "kanban_permissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "eventos_calendario" (
    "id" TEXT NOT NULL,
    "leadId" TEXT NOT NULL,
    "imovelId" TEXT NOT NULL,
    "tipo" "EventoTipo" NOT NULL DEFAULT 'VISITA',
    "dataHora" TIMESTAMP(3) NOT NULL,
    "observacao" TEXT,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "eventos_calendario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lead_timeline" (
    "id" TEXT NOT NULL,
    "leadId" TEXT NOT NULL,
    "action" "TimelineAction" NOT NULL,
    "description" TEXT NOT NULL,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "lead_timeline_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "kanban_boards_isGlobal_idx" ON "kanban_boards"("isGlobal");

-- CreateIndex
CREATE INDEX "kanban_boards_ownerId_idx" ON "kanban_boards"("ownerId");

-- CreateIndex
CREATE INDEX "kanban_columns_boardId_idx" ON "kanban_columns"("boardId");

-- CreateIndex
CREATE INDEX "kanban_columns_order_idx" ON "kanban_columns"("order");

-- CreateIndex
CREATE UNIQUE INDEX "kanban_permissions_userId_key" ON "kanban_permissions"("userId");

-- CreateIndex
CREATE INDEX "eventos_calendario_dataHora_idx" ON "eventos_calendario"("dataHora");

-- CreateIndex
CREATE INDEX "eventos_calendario_leadId_idx" ON "eventos_calendario"("leadId");

-- CreateIndex
CREATE INDEX "eventos_calendario_imovelId_idx" ON "eventos_calendario"("imovelId");

-- CreateIndex
CREATE INDEX "eventos_calendario_tipo_idx" ON "eventos_calendario"("tipo");

-- CreateIndex
CREATE INDEX "eventos_calendario_completed_idx" ON "eventos_calendario"("completed");

-- CreateIndex
CREATE INDEX "eventos_calendario_createdAt_idx" ON "eventos_calendario"("createdAt");

-- CreateIndex
CREATE INDEX "lead_timeline_leadId_idx" ON "lead_timeline"("leadId");

-- CreateIndex
CREATE INDEX "lead_timeline_createdAt_idx" ON "lead_timeline"("createdAt");

-- CreateIndex
CREATE INDEX "leads_priority_idx" ON "leads"("priority");

-- CreateIndex
CREATE INDEX "leads_kanbanColumnId_idx" ON "leads"("kanbanColumnId");

-- AddForeignKey
ALTER TABLE "kanban_boards" ADD CONSTRAINT "kanban_boards_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "kanban_columns" ADD CONSTRAINT "kanban_columns_boardId_fkey" FOREIGN KEY ("boardId") REFERENCES "kanban_boards"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "kanban_permissions" ADD CONSTRAINT "kanban_permissions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "leads" ADD CONSTRAINT "leads_kanbanColumnId_fkey" FOREIGN KEY ("kanbanColumnId") REFERENCES "kanban_columns"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "eventos_calendario" ADD CONSTRAINT "eventos_calendario_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "leads"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "eventos_calendario" ADD CONSTRAINT "eventos_calendario_imovelId_fkey" FOREIGN KEY ("imovelId") REFERENCES "imoveis"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lead_timeline" ADD CONSTRAINT "lead_timeline_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "leads"("id") ON DELETE CASCADE ON UPDATE CASCADE;
