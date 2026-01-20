-- AlterTable
ALTER TABLE "leads" ADD COLUMN "score" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN "temperatura" TEXT NOT NULL DEFAULT 'morno',
ADD COLUMN "ultimaInteracao" TIMESTAMP(3),
ADD COLUMN "proximoContato" TIMESTAMP(3),
ADD COLUMN "valorInteresse" DECIMAL(12,2),
ADD COLUMN "cpf" TEXT,
ADD COLUMN "dataNascimento" TIMESTAMP(3),
ADD COLUMN "preferencias" JSONB;

-- CreateIndex
CREATE INDEX "leads_temperatura_idx" ON "leads"("temperatura");

-- CreateIndex
CREATE INDEX "leads_score_idx" ON "leads"("score");

-- CreateIndex
CREATE INDEX "leads_ultimaInteracao_idx" ON "leads"("ultimaInteracao");
