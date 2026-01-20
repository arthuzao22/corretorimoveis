-- CreateEnum
CREATE TYPE "MessageTemplateCategoria" AS ENUM ('BOAS_VINDAS', 'ACOMPANHAMENTO', 'AGENDAMENTO', 'POS_VISITA', 'OUTRO');

-- AlterTable
ALTER TABLE "kanban_columns" ADD COLUMN     "isInitial" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "message_templates" (
    "id" TEXT NOT NULL,
    "corretorId" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "mensagem" TEXT NOT NULL,
    "categoria" "MessageTemplateCategoria" NOT NULL DEFAULT 'OUTRO',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "message_templates_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "message_templates_corretorId_idx" ON "message_templates"("corretorId");

-- CreateIndex
CREATE INDEX "message_templates_categoria_idx" ON "message_templates"("categoria");

-- CreateIndex
CREATE INDEX "kanban_columns_isInitial_idx" ON "kanban_columns"("isInitial");

-- AddForeignKey
ALTER TABLE "message_templates" ADD CONSTRAINT "message_templates_corretorId_fkey" FOREIGN KEY ("corretorId") REFERENCES "corretor_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
