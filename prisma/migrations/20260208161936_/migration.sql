-- DropForeignKey
ALTER TABLE "eventos_calendario" DROP CONSTRAINT "eventos_calendario_imovelId_fkey";

-- DropForeignKey
ALTER TABLE "eventos_calendario" DROP CONSTRAINT "eventos_calendario_leadId_fkey";

-- DropForeignKey
ALTER TABLE "leads" DROP CONSTRAINT "leads_imovelId_fkey";

-- AlterTable
ALTER TABLE "eventos_calendario" ALTER COLUMN "leadId" DROP NOT NULL,
ALTER COLUMN "imovelId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "leads" ADD CONSTRAINT "leads_imovelId_fkey" FOREIGN KEY ("imovelId") REFERENCES "imoveis"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "eventos_calendario" ADD CONSTRAINT "eventos_calendario_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "leads"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "eventos_calendario" ADD CONSTRAINT "eventos_calendario_imovelId_fkey" FOREIGN KEY ("imovelId") REFERENCES "imoveis"("id") ON DELETE SET NULL ON UPDATE CASCADE;
