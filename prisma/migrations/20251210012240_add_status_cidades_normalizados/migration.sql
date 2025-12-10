-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'CORRETOR');

-- CreateEnum
CREATE TYPE "ImovelTipo" AS ENUM ('VENDA', 'ALUGUEL');

-- CreateEnum
CREATE TYPE "ImovelStatus" AS ENUM ('ATIVO', 'INATIVO', 'VENDIDO', 'ALUGADO');

-- CreateEnum
CREATE TYPE "LeadStatus" AS ENUM ('NOVO', 'CONTATADO', 'QUALIFICADO', 'NEGOCIACAO', 'CONVERTIDO', 'PERDIDO');

-- CreateTable
CREATE TABLE "cidades" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "uf" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cidades_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "imovel_status_config" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "cor" TEXT,
    "ordem" INTEGER NOT NULL DEFAULT 0,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "imovel_status_config_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lead_status_config" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "cor" TEXT,
    "ordem" INTEGER NOT NULL DEFAULT 0,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "lead_status_config_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" "UserRole" NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "corretor_profiles" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "bio" TEXT,
    "phone" TEXT,
    "photo" TEXT,
    "whatsapp" TEXT,
    "cidade" TEXT,
    "cidadeId" TEXT,
    "approved" BOOLEAN NOT NULL DEFAULT false,
    "landingAtiva" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "corretor_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "admins" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "admins_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "imoveis" (
    "id" TEXT NOT NULL,
    "corretorId" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "descricao" TEXT NOT NULL,
    "tipo" "ImovelTipo" NOT NULL,
    "status" "ImovelStatus" NOT NULL DEFAULT 'ATIVO',
    "statusConfigId" TEXT,
    "valor" DECIMAL(12,2) NOT NULL,
    "endereco" TEXT NOT NULL,
    "cidade" TEXT NOT NULL,
    "cidadeId" TEXT,
    "estado" TEXT NOT NULL,
    "cep" TEXT,
    "bairro" TEXT,
    "quartos" INTEGER,
    "banheiros" INTEGER,
    "suites" INTEGER,
    "area" DECIMAL(10,2),
    "areaTerreno" DECIMAL(10,2),
    "garagem" INTEGER,
    "images" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "views" INTEGER NOT NULL DEFAULT 0,
    "latitude" DECIMAL(10,8),
    "longitude" DECIMAL(11,8),
    "destaque" BOOLEAN NOT NULL DEFAULT false,
    "condominio" DECIMAL(10,2),
    "iptu" DECIMAL(10,2),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "imoveis_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "leads" (
    "id" TEXT NOT NULL,
    "imovelId" TEXT,
    "corretorId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT NOT NULL,
    "message" TEXT,
    "origem" TEXT DEFAULT 'site',
    "status" "LeadStatus" NOT NULL DEFAULT 'NOVO',
    "statusConfigId" TEXT,
    "anotacoes" TEXT,
    "dataContato" TIMESTAMP(3),
    "dataAgendamento" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "leads_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "landing_blocos" (
    "id" TEXT NOT NULL,
    "corretorId" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "titulo" TEXT,
    "subtitulo" TEXT,
    "texto" TEXT,
    "imagens" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "videoUrl" TEXT,
    "ordem" INTEGER NOT NULL,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "config" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "landing_blocos_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "cidades_slug_key" ON "cidades"("slug");

-- CreateIndex
CREATE INDEX "cidades_nome_idx" ON "cidades"("nome");

-- CreateIndex
CREATE INDEX "cidades_uf_idx" ON "cidades"("uf");

-- CreateIndex
CREATE INDEX "cidades_slug_idx" ON "cidades"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "cidades_nome_uf_key" ON "cidades"("nome", "uf");

-- CreateIndex
CREATE UNIQUE INDEX "imovel_status_config_slug_key" ON "imovel_status_config"("slug");

-- CreateIndex
CREATE INDEX "imovel_status_config_slug_idx" ON "imovel_status_config"("slug");

-- CreateIndex
CREATE INDEX "imovel_status_config_ordem_idx" ON "imovel_status_config"("ordem");

-- CreateIndex
CREATE UNIQUE INDEX "lead_status_config_slug_key" ON "lead_status_config"("slug");

-- CreateIndex
CREATE INDEX "lead_status_config_slug_idx" ON "lead_status_config"("slug");

-- CreateIndex
CREATE INDEX "lead_status_config_ordem_idx" ON "lead_status_config"("ordem");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "corretor_profiles_userId_key" ON "corretor_profiles"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "corretor_profiles_slug_key" ON "corretor_profiles"("slug");

-- CreateIndex
CREATE INDEX "corretor_profiles_slug_idx" ON "corretor_profiles"("slug");

-- CreateIndex
CREATE INDEX "corretor_profiles_cidadeId_idx" ON "corretor_profiles"("cidadeId");

-- CreateIndex
CREATE UNIQUE INDEX "admins_userId_key" ON "admins"("userId");

-- CreateIndex
CREATE INDEX "imoveis_corretorId_idx" ON "imoveis"("corretorId");

-- CreateIndex
CREATE INDEX "imoveis_tipo_idx" ON "imoveis"("tipo");

-- CreateIndex
CREATE INDEX "imoveis_status_idx" ON "imoveis"("status");

-- CreateIndex
CREATE INDEX "imoveis_statusConfigId_idx" ON "imoveis"("statusConfigId");

-- CreateIndex
CREATE INDEX "imoveis_cidade_idx" ON "imoveis"("cidade");

-- CreateIndex
CREATE INDEX "imoveis_cidadeId_idx" ON "imoveis"("cidadeId");

-- CreateIndex
CREATE INDEX "imoveis_destaque_idx" ON "imoveis"("destaque");

-- CreateIndex
CREATE INDEX "imoveis_createdAt_idx" ON "imoveis"("createdAt");

-- CreateIndex
CREATE INDEX "imoveis_valor_idx" ON "imoveis"("valor");

-- CreateIndex
CREATE INDEX "imoveis_tipo_valor_idx" ON "imoveis"("tipo", "valor");

-- CreateIndex
CREATE INDEX "imoveis_tipo_cidade_idx" ON "imoveis"("tipo", "cidade");

-- CreateIndex
CREATE INDEX "imoveis_quartos_idx" ON "imoveis"("quartos");

-- CreateIndex
CREATE INDEX "leads_corretorId_idx" ON "leads"("corretorId");

-- CreateIndex
CREATE INDEX "leads_imovelId_idx" ON "leads"("imovelId");

-- CreateIndex
CREATE INDEX "leads_status_idx" ON "leads"("status");

-- CreateIndex
CREATE INDEX "leads_statusConfigId_idx" ON "leads"("statusConfigId");

-- CreateIndex
CREATE INDEX "leads_createdAt_idx" ON "leads"("createdAt");

-- CreateIndex
CREATE INDEX "leads_origem_idx" ON "leads"("origem");

-- CreateIndex
CREATE INDEX "landing_blocos_corretorId_idx" ON "landing_blocos"("corretorId");

-- CreateIndex
CREATE INDEX "landing_blocos_ordem_idx" ON "landing_blocos"("ordem");

-- AddForeignKey
ALTER TABLE "corretor_profiles" ADD CONSTRAINT "corretor_profiles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "corretor_profiles" ADD CONSTRAINT "corretor_profiles_cidadeId_fkey" FOREIGN KEY ("cidadeId") REFERENCES "cidades"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "admins" ADD CONSTRAINT "admins_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "imoveis" ADD CONSTRAINT "imoveis_corretorId_fkey" FOREIGN KEY ("corretorId") REFERENCES "corretor_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "imoveis" ADD CONSTRAINT "imoveis_cidadeId_fkey" FOREIGN KEY ("cidadeId") REFERENCES "cidades"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "imoveis" ADD CONSTRAINT "imoveis_statusConfigId_fkey" FOREIGN KEY ("statusConfigId") REFERENCES "imovel_status_config"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "leads" ADD CONSTRAINT "leads_imovelId_fkey" FOREIGN KEY ("imovelId") REFERENCES "imoveis"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "leads" ADD CONSTRAINT "leads_corretorId_fkey" FOREIGN KEY ("corretorId") REFERENCES "corretor_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "leads" ADD CONSTRAINT "leads_statusConfigId_fkey" FOREIGN KEY ("statusConfigId") REFERENCES "lead_status_config"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "landing_blocos" ADD CONSTRAINT "landing_blocos_corretorId_fkey" FOREIGN KEY ("corretorId") REFERENCES "corretor_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
